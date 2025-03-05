pub mod password;
pub mod token;

use chrono::{Local, Timelike};
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};
use std::{env, fs};
use time::UtcOffset;
use time::macros::format_description;
use tracing_appender::rolling::{RollingFileAppender, Rotation};
use tracing_subscriber::fmt::time::OffsetTime;
use tracing_subscriber::{EnvFilter, fmt, layer::SubscriberExt, util::SubscriberInitExt};

/// 日志管理器，负责日志的初始化和旧日志文件的清理
pub struct LogManager {
    _guard: tracing_appender::non_blocking::WorkerGuard,
    log_dir: PathBuf,
    retention_days: u64,
}

impl LogManager {
    /// 创建新的日志管理器
    ///
    /// # 参数
    /// * `log_dir` - 日志文件目录
    /// * `file_name` - 日志文件名（不含路径）
    /// * `retention_days` - 日志保留天数
    ///
    /// # 返回
    /// 返回配置好的日志管理器实例
    pub fn new(log_dir: impl AsRef<Path>, file_name: &str, retention_days: u64) -> Self {
        // -- 确保日志目录存在
        let log_dir_path = log_dir.as_ref().to_path_buf();
        if let Err(e) = fs::create_dir_all(&log_dir_path) {
            eprintln!("创建日志目录失败 {:?}: {}", log_dir_path, e);
            // 如果无法创建目录，使用当前目录
            let fallback_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
            eprintln!("使用备用日志目录: {:?}", fallback_dir);
            return Self::new(fallback_dir, file_name, retention_days);
        }

        // -- 创建滚动日志 appender
        let file_appender = RollingFileAppender::new(Rotation::DAILY, &log_dir_path, file_name);

        // -- 设置非阻塞写入
        let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);

        // -- 从环境变量获取时区配置，默认东八区 (+8)
        let offset = env::var("TZ_OFFSET")
            .ok()
            .and_then(|x| x.parse::<i8>().ok())
            .unwrap_or(8);

        let timer = OffsetTime::new(
            UtcOffset::from_hms(offset, 0, 0).unwrap(),
            format_description!("[year]-[month]-[day] [hour]:[minute]:[second]"),
        );

        // -- 配置并初始化日志系统
        tracing_subscriber::registry()
            .with(
                EnvFilter::try_from_env("LOG_LEVEL")
                    .unwrap_or_else(|_| "info,axum_backend=info,tower_http=info".parse().unwrap()),
            )
            .with(
                fmt::layer()
                    .with_writer(non_blocking)
                    .with_timer(timer.clone())
                    .with_ansi(false)
                    .with_target(true)
                    .with_file(true)
                    .with_line_number(true),
            )
            .with(
                fmt::layer()
                    .with_timer(timer.clone())
                    .with_writer(std::io::stdout)
                    .with_ansi(true),
            )
            .init();

        tracing::info!(
            "日志系统初始化完成，日志目录: {:?}, 保留天数: {}",
            log_dir_path,
            retention_days
        );

        LogManager {
            _guard: guard,
            log_dir: log_dir_path,
            retention_days,
        }
    }

    /// 启动日志清理任务
    ///
    /// 此方法会启动一个异步任务，定期清理超过保留期限的日志文件
    pub async fn start_cleanup_task(self) {
        let log_dir = self.log_dir.clone();
        let retention_days = self.retention_days;

        tokio::spawn(async move {
            // -- 保持 _guard 活着，确保在程序退出前刷新所有日志
            let _guard = self._guard;
            let retention_duration = Duration::from_secs(retention_days * 24 * 60 * 60);

            loop {
                // -- 计算下次执行时间（凌晨 3 点）
                let now = Local::now();
                let next_run = if now.hour() >= 3 {
                    // 如果当前时间已经过了今天的 3 点，则安排在明天 3 点执行
                    now.date_naive()
                        .succ_opt()
                        .and_then(|date| date.and_hms_opt(3, 0, 0))
                        .expect("有效的时间")
                        .and_local_timezone(Local)
                        .unwrap()
                } else {
                    // 否则安排在今天 3 点执行
                    now.date_naive()
                        .and_hms_opt(3, 0, 0)
                        .expect("有效的时间")
                        .and_local_timezone(Local)
                        .unwrap()
                };

                let wait_duration = (next_run - now)
                    .to_std()
                    .unwrap_or(Duration::from_secs(24 * 60 * 60));
                tracing::info!(
                    "下次日志清理计划在 {} 执行",
                    next_run.format("%Y-%m-%d %H:%M:%S")
                );

                // -- 等待到下次执行时间
                tokio::time::sleep(wait_duration).await;

                tracing::info!("开始清理旧日志文件，保留天数: {}", retention_days);

                // -- 执行清理
                Self::cleanup_logs(&log_dir, retention_duration).await;
            }
        });
    }

    /// 执行日志清理操作
    ///
    /// # 参数
    /// * `log_dir` - 日志目录
    /// * `retention_duration` - 保留时长
    async fn cleanup_logs(log_dir: &Path, retention_duration: Duration) {
        let now = SystemTime::now();
        let mut deleted_count = 0;
        let mut error_count = 0;
        let mut total_size_freed = 0u64;

        match fs::read_dir(log_dir) {
            Ok(entries) => {
                for entry in entries.filter_map(Result::ok) {
                    let path = entry.path();

                    // 只处理文件
                    if !path.is_file() {
                        continue;
                    }

                    // 检查是否是日志文件（通常以日期为后缀）
                    if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                        if !file_name.contains(".log.") {
                            continue;
                        }

                        // 检查文件修改时间
                        match fs::metadata(&path) {
                            Ok(metadata) => {
                                if let Ok(modified) = metadata.modified() {
                                    if let Ok(duration) = now.duration_since(modified) {
                                        if duration > retention_duration {
                                            // 获取文件大小
                                            let file_size = metadata.len();

                                            // 删除文件
                                            match fs::remove_file(&path) {
                                                Ok(_) => {
                                                    deleted_count += 1;
                                                    total_size_freed += file_size;
                                                    tracing::info!(
                                                        "已删除过期日志文件: {:?} (大小: {} 字节)",
                                                        path,
                                                        file_size
                                                    );

                                                    // 短暂暂停，减少 I/O 压力
                                                    tokio::time::sleep(Duration::from_millis(20))
                                                        .await;
                                                }
                                                Err(e) => {
                                                    error_count += 1;
                                                    tracing::error!(
                                                        "删除日志文件失败 {:?}: {}",
                                                        path,
                                                        e
                                                    );
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            Err(e) => {
                                tracing::warn!("无法获取文件元数据 {:?}: {}", path, e);
                            }
                        }
                    }
                }

                // 转换为 MB 显示
                let size_mb = total_size_freed as f64 / 1024.0 / 1024.0;

                tracing::info!(
                    "日志清理完成: 删除了 {} 个文件，释放了 {:.2} MB 空间，失败 {} 个",
                    deleted_count,
                    size_mb,
                    error_count
                );
            }
            Err(e) => {
                tracing::error!("读取日志目录失败 {:?}: {}", log_dir, e);
            }
        }
    }
}

/// 初始化生产环境日志系统
///
/// 此函数配置日志系统并启动日志清理任务
///
/// # 参数
/// * `log_dir` - 可选的日志目录，如果不提供则使用默认目录
/// * `retention_days` - 日志保留天数，默认为 7 天
pub async fn init_production_logging(log_dir: Option<&str>, retention_days: Option<u64>) {
    // 使用提供的日志目录或默认目录
    let log_directory = log_dir.unwrap_or("/var/log/axum_backend");
    // 使用提供的保留天数或默认值
    let days = retention_days.unwrap_or(7);

    // 创建日志管理器
    let log_manager = LogManager::new(log_directory, "application.log", days);

    // 启动日志清理任务
    log_manager.start_cleanup_task().await;
}
