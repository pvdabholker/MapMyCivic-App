from pydantic import BaseModel


class NoticeCreate(BaseModel):
    title: str
    description: str
    department: str
    priority: str

    