from pydantic import BaseModel

class OTPVerify(BaseModel):

    user_id: int

    otp_code: str