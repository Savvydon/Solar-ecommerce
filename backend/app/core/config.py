from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./savvy_energy.db"
    jwt_secret: str = "development-only-change-this-secret"
    jwt_expire_minutes: int = 1440
    cors_origins: str = "http://localhost:5173"
    admin_email: str = ""
    admin_password: str = ""
    paystack_secret_key: str = ""
    frontend_url: str = "http://localhost:5173"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins(self):
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

settings = Settings()
