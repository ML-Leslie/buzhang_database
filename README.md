# buzhang 记账™

https://github.com/user-attachments/assets/e39a7839-cc8d-45ec-870c-27fc57a9829e

> - 在 windows 上使用该教程
> - 前端：React + vite + Tailwind CSS
> - 后端：Spring Boot + Spring Data JPA + PostgreSQL（OpenGauss）
> - 数据库：OpenGauss 

---

### 1. 运行 opengauss（数据库）
#### docker 运行 opengauss 
- 在docker desktop 中搜索：
  - ![alt text](images/README/image.png)
  - 选择版本：![alt text](images/README/image-1.png)
  - 下载下来后，打开终端，运行以下命令：
    - `docker run --name opengauss --privileged=true -d -e GS_PASSWORD=OpenGauss@123 -p 5432:5432 enmotech/opengauss:3.1.0`
    - 命令解释：
      - `docker run`：运行一个容器
      - `--name opengauss`：为容器指定名称
      - `--privileged=true`：授予容器特权模式
      - `-d`：以后台模式运行容器
      - `-e GS_PASSWORD=OpenGauss@123`：设置环境变量，其中 `GS_PASSWORD` 是 GaussDB 的密码
      - `-p 5432:5432`：将容器的 5432 端口映射到宿主机的 5432 端口
      - `enmotech/opengauss:3.1.0`：使用的 Docker 镜像及其版本
    - 运行成功后，可以通过以下命令查看容器状态：
      - `docker ps`

#### 【可略】可以使用 DBeaver 连接 opengauss
- 在 DBeaver 中创建一个新连接，选择 PostgreSQL，然后输入以下信息：
  - 主机名：localhost
  - 端口：5432
  - 数据库名称：postgres
  - 用户名：gaussdb
  - 密码：OpenGauss@123

### 2. 运行后端
- 后端运行 `backend\src\main\java\com\buzhang\demo\DemoApplication.java` 文件即可

### 3. 运行前端
- 另外打开一个终端，进入 `frontend` 目录，运行以下命令：
  - `npm install`
  - `npm run dev`