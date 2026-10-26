from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Literal

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
class LoginIn(BaseModel): email: EmailStr; password: str
class UserOut(BaseModel):
    id: int; name: str; email: EmailStr; role: str
    model_config = ConfigDict(from_attributes=True)
class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=200); brand: str = "Savvy Energy"; model: str = "Standard"
    category: str; description: str = ""; price: float = Field(gt=0); currency: str = "NGN"
    image_url: str = ""; stock: int = Field(default=0, ge=0); is_active: bool = True
class ProductOut(ProductIn):
    id: int
    model_config = ConfigDict(from_attributes=True)
class OrderItemIn(BaseModel): product_id: int; quantity: int = Field(ge=1, le=1000)
class OrderIn(BaseModel):
    items: list[OrderItemIn] = Field(min_length=1)
    shipping_name: str = Field(min_length=2); shipping_phone: str = Field(min_length=7)
    shipping_address: str = Field(min_length=8)
class QuoteIn(BaseModel):
    name: str = Field(min_length=2); email: EmailStr; phone: str = Field(min_length=7); message: str = Field(min_length=5)
class QuoteStatusIn(BaseModel): status: Literal['new','contacted','quoted','closed']
