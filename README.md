# Single Cell HiC Data Visualization and Analysis Tool

A Vite Typescript React project for scHiC data visualization and analysis using Redux, Pixi.js, and D3.js.

## Features

- Load and visualize single-cell HiC (scHiC) data in multiple formats
- Interactively explore and analyze scHiC data with various visualizations
- Visualize data as contact maps, signal tracks, and scatter plots
- Perform clustering, dimensionality reduction, and other data analysis techniques
- Share and collaborate on data visualizations with others

## Prerequisites

- Docker `>=19.03.13` (tested on 19.03.13, 26.1.0)
- Docker-compose `>=v2.29.2` (tested on v2.29.2, v1.26.0)

## Running the Frontend Locally

### 1. Clone the repository

```bash
git clone https://github.com/ChouYunShuo/scHiC-Browser
```

### 2. Navigate to the Project Directory

```bash
cd scHiC-Browser
```

### 3. Update apiEndpoint in apiSlice.ts
Navigate to the redux directory:

```bash
cd src/redux
```
Then, update the apiEndpoint in apiSlice.ts to point to your local data server. For example:

```typescript
export const apiEndpoint = "http://localhost:8020";
```
### 4. Run the Application Using Docker Compose
```
docker-compose up --build 
```
### 5. Open the Application in Your Browser
Once the application is running, open your web browser and go to:
```bash
http://localhost:8088
```

## License

This project is licensed under tthe BSD 3-Clause License - see the [LICENSE](/LICENSE) file for details.
