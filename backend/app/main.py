from fastapi import FastAPI

app = FastAPI(
    title = "Dasaiko API",
    description = "AI-native Knowledge Operating System",
    version = "0.1.0",
)

@app.get("/")
def root():
    return {
        "message": "Welcome to Dasaiko!"
    }