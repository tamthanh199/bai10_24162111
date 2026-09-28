IF DB_ID('jwt_nimbus_24162111') IS NULL
BEGIN
    CREATE DATABASE jwt_nimbus_24162111;
END
GO

USE jwt_nimbus_24162111;
GO

-- Bảng users sẽ được Spring Data JPA/Hibernate tạo tự động
-- nhờ spring.jpa.hibernate.ddl-auto=update.
