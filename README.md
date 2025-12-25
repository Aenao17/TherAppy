# TherAppy

## ▶ How to run

1. Clone the repository
2. Install Docker Desktop
3. Open a terminal in the Backend folder
4. Run the following command to build and start the database:
    ```bash
    docker-compose up -d
    ```

5. Run the following command to build and start the application:
    ```bash
    ./gradlew bootRun
    ```
   
6. Run npm install in the Frontend folder to install dependencies
7. Run the following command to start the frontend:
    ```bash
    ionic serve
    ```
   
8. Open your browser and navigate to `http://localhost:8100` to access the application.