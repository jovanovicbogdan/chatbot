import os
import logging
from dotenv import load_dotenv

load_dotenv()

# logging.getLogger("httpx").setLevel(logging.WARNING)


class HealthCheckFilter(logging.Filter):
    def filter(self, record):
        return record.getMessage().find("GET / ") == -1


def setup_logger():
    logger = logging.getLogger()
    log_handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s %(levelname)s - [%(name)s.py] - %(message)s", "%Y-%m-%d %H:%M:%S"
    )
    log_level = os.getenv("LOG_LEVEL", "info").upper()
    log_handler.setLevel(log_level)
    log_handler.setFormatter(formatter)
    logger.addHandler(log_handler)
    return logger


log = setup_logger()
log.setLevel(logging.INFO)
logging.getLogger("uvicorn.access").addFilter(HealthCheckFilter())
