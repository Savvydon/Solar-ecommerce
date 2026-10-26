from app.core.config import Settings


def test_frontend_origins_are_read_from_comma_separated_setting():
    settings = Settings(
        frontend_url=(
            "http://localhost:5176, "
            "https://savvy-energy.example,https://savvy-energy.example/"
        )
    )

    assert settings.allowed_origins == [
        "http://localhost:5176",
        "https://savvy-energy.example",
    ]


def test_empty_frontend_origin_setting_returns_empty_list():
    settings = Settings(frontend_url="")
    assert settings.allowed_origins == []
