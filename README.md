# TherAppy

## ▶ How to run

1. Clone the repository
2. Install Docker Desktop (https://docs.docker.com/get-started/get-docker)
3. Run the following command in Backend folder to build and start the database:
    ```bash
    docker-compose up -d
    ```

4. Run the following command in Backend folder to build and start the application:
    ```bash
    ./gradlew bootRun
    ```
   
5. Run npm install in the Frontend folder to install dependencies. Make sure you have ionic framework installed: https://ionicframework.com/docs/intro/cli
6. Run the following command in the Frontend folder to start the frontend:
    ```bash
    ionic serve
    ```
7. Open your browser and navigate to `http://localhost:8100` to access the application.
