from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./savvy_energy.db"
    jwt_secret: str = "development-only-change-this-secret"
    jwt_expire_minutes: int = 1440
    frontend_url: str = "http://localhost:5173,http://localhost:5176"
    upload_dir: str = "./uploads"
    admin_email: str = ""
    admin_password: str = ""
    paystack_secret_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins(self) -> list[str]:
        origins = [
            origin.strip().rstrip("/")
            for origin in self.frontend_url.split(",")
            if origin.strip()
        ]
        return list(dict.fromkeys(origins))


settings = Settings()
