---
layout: post
title:  Spring Boot(二一) - 数据库初始化
date:   2017-07-11 11:29:00 +0800
categories: 技术文档
tag: Spring-Boot
---

* content
{:toc}


一个数据库可以使用不同的方式进行初始化，这取决于所使用的技术栈。或者可以手动完成该任务，只要数据库是独立的应用。


使用JPA初始化数据库
==================

JPA有个生成DDL的特性，并且可以设置为在数据库启动时运行，这可以通过两个外部属性进行控制：

+ `spring.jpa.generate-ddl` （ boolean ）控制该特性的关闭和开启，跟实现者没关系。
+ `spring.jpa.hibernate.ddl-auto` （ enum ）是一个Hibernate特性，用于更细力度的控制该行为，更多详情参考以下内容。


使用Hibernate初始化数据库
==================

可以显式设置 `spring.jpa.hibernate.ddl-auto` ，标准的Hibernate属性值有 `none` ， `validate` ， `update` ， `create` ， `create-drop` 。Spring Boot根据数据库是否为内嵌数据库来选择相应的默认值，如果是内嵌型的则默认值为 `create-drop` ，否则为 `none` 。通过查看 `Connection` 类型可以检查是否为内嵌型数据库，`hsqldb`，`h2`和`derby`是内嵌的，其他都不是。当从内存数据库迁移到一个真正的数据库时，需要当心，在新的平台中不能对数据库表和数据是否存在进行臆断，也需要显式设置 `ddl-auto` ，或使用其他机制初始化数据库。

> 可以通过启用`org.hibernate.SQL` 来输出Schema的创建过程。当[DEBUG MODE](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-logging-console-output)被开启的时候，这个功能就已经被自动开启了。

此外，启动时处于classpath根目录下的 `import.sql` 文件会被执行(前提是`ddl-auto`属性被设置为 `create` 或 `create-drop`)。这在demos或测试时很有用，但在生产环境中可能不期望这样。这是Hibernate的特性，和Spring没有一点关系。


使用Spring JDBC初始化数据库
==================

Spring JDBC有一个初始化 `DataSource` 特性，Spring Boot默认启用该特性，并从标准的位置 `schema.sql` 和 `data.sql` （位于classpath根目录）加载SQL。此外，Spring Boot将加载 `schema-${platform}.sql` 和 `data-${platform}.sql` 文件（如果存在），在这里 `platform` 是 `spring.datasource.platform` 的值，比如，可以将它设置为数据库的供应商名称（ `hsqldb` , `h2` , `oracle` , `mysql` , `postgresql` 等）。Spring Boot默认启用Spring JDBC初始化快速失败特性，所以如果脚本导致异常产生，那应用程序将启动失败。脚本的位置可以通过设置 `spring.datasource.schema` 和 `spring.datasource.data` 来改变，如果设置 `spring.datasource.initialize=false` 则哪个位置都不会被处理。

可以设置 `spring.datasource.continue-on-error=true` 禁用快速失败特性。一旦应用程序成熟并被部署了很多次，那该设置就很有用，因为脚本可以充当"可怜人的迁移"-例如，插入失败时意味着数据已经存在，也就没必要阻止应用继续运行。

如果想要在一个JPA应用中使用 `schema.sql` ，那如果Hibernate试图创建相同的表， `ddl-auto=create-drop` 将导致错误产生。为了避免那些错误，可以将 `ddl-auto` 设置为""（推荐）或 none 。不管是否使用 `ddl-auto=createdrop`，你总可以使用 `data.sql` 初始化新数据。


初始化Spring Batch数据库
==================

如果正在使用Spring Batch，那么它会为大多数的流行数据库平台预装SQL初始化脚本。Spring Boot会检测你的数据库类型，并默认执行那些脚本，在这种情况下将关闭快速失败特性（错误被记录但不会阻止应用启动）。这是因为那些脚本是可信任的，通常不会包含bugs，所以错误会被忽略掉，并且对错误的忽略可以让脚本具有幂等性。可以使用 `spring.batch.initializer.enabled=false` 显式关闭初始化功能。


使用高级数据迁移工具
==================

Spring Boot支持两种高级数据迁移工具[Flyway](http://flywaydb.org/)(基于SQL)和[Liquibase](http://www.liquibase.org/)(XML)。

启动时执行Flyway数据库迁移
------------------

想要在启动时自动运行Flyway数据库迁移，需要将 `org.flywaydb:flywaycore` 添加到的classpath下。

迁移是一些 `V<VERSION>__<NAME>.sql` 格式的脚本（ `<VERSION>` 是一个下划线分割的版本号，比如'1'或'2_1'）。默认情况下，它们存放在 `classpath:db/migration` 文件夹中，但可以使用 `flyway.locations` （一个列表）改变它。

{% highlight text %}
flyway.locations=db/migration/{vendor}
{% endhighlight %}

详情可参考flyway-core中的 `Flyway` 类，查看一些可用的配置，比如schemas。Spring Boot在[FlywayProperties](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/flyway/FlywayProperties.java)中提供了一个小的属性集，可用于禁止迁移，或关闭位置检测。Spring Boot将调用 `Flyway.migrate()` 执行数据库迁移，如果想要更多控制可提供一个实现[FlywayMigrationStrategy](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/flyway/FlywayMigrationStrategy.java)的 `@Bean` 。

默认情况下，Flyway将自动注入（ `@Primary` ） `DataSource` 到上下文，并用它进行数据迁移。如果想使用不同的 `DataSource` ，可以创建一个，并将它标记为 `@FlywayDataSource` 的 `@Bean` -如果这样做了，且想要两个数据源，记得创建另一个并将它标记为 `@Primary` ，或者可以通过在外部配置文件中设置 `flyway.[url,user,password]` 来使用Flyway的`原生DataSource` 。

点击查看[Flyway示例](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-samples/spring-boot-sample-flyway)，作为参考。

启动时执行Liquibase数据库迁移
------------------

想要在启动时自动运行Liquibase数据库迁移，需要将 `org.liquibase:liquibase-core` 添加到classpath下。可以使用 `liquibase.change-log` 设置master变化日志位置，默认从 `db/changelog/db.changelog-master.yaml` 读取。除了YAML，Liquibase还支持JSON, XML和SQL改变日志格式。

默认情况下，Liquibase将自动注入(@Primary)的DataSource到上下文中作为迁移使用。如果想要使用不同的DataSource，就需要创建一个DataSource，并且用标记`@Bean` 为 `@LiquibaseDataSource`， 如果这么做的话记得要创建另一个@Primary注解的DataSource(如果想要两个DataSource的话)。或者也可以通过设置外部配置`liquibase.[url,user,password]`来使用Liquibase’s原生DataSource。

查看[LiquibaseProperties](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/liquibase/LiquibaseProperties.java)获取可用配置，比如上下文，默认schema等。

点击查看[Liquibase示例](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-samples/spring-boot-sample-liquibase)作为参考。


实验
==================

> 本实验使用独立的Mysql数据库进行。

创建一个Maven项目
------------------

![/images/blog/spring-boot/21-database-init/01-new-maven-project.png](/images/blog/spring-boot/21-database-init/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.freud.test</groupId>
    <artifactId>spring-boot-21</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>spring-boot-21</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>

    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>1.5.4.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
{% endhighlight %}

application.yml
------------------

{% highlight yml %}
spring:
  application:
    name: test-21
  jpa:
    generate-ddl: false
    show-sql: true
    hibernate: 
      ddl-auto: none
  datasource:
    platform: MYSQL
    continue-on-error: false
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://localhost:3306/test?useSSL=false
    username: root
    password: root
    schema: classpath:schema.sql
    data: classpath:data.sql
server:
  port: 9090
{% endhighlight %}

schema.sql
------------------

{% highlight sql %}
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `age` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELETE FROM `user`;
{% endhighlight %}

data.sql
------------------

{% highlight sql %}
insert into user(id, name, age) values(1,'Freud1',29);
insert into user(id, name, age) values(2,'Freud2',29);
insert into user(id, name, age) values(3,'Freud3',29);
insert into user(id, name, age) values(4,'Freud4',29);
insert into user(id, name, age) values(5,'Freud5',29);
{% endhighlight %}

App.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @author Freud
 */
@SpringBootApplication
public class App {

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/21-database-init/02-project-hierarchy.png](/images/blog/spring-boot/21-database-init/02-project-hierarchy.png)


运行
==================

先在本地的Mysql数据库创建一个空的数据库 - `test`

{% highlight java %}
CREATE DATABASE `test`;
{% endhighlight %}

![/images/blog/spring-boot/21-database-init/03-create-mysql-database.png](/images/blog/spring-boot/21-database-init/03-create-mysql-database.png)

然后以Main启动的方式执行App.java，当服务启动之后查看数据库

![/images/blog/spring-boot/21-database-init/05-create-mysql-table.png](/images/blog/spring-boot/21-database-init/05-create-mysql-table.png)

![/images/blog/spring-boot/21-database-init/06-init-data-for-table.png](/images/blog/spring-boot/21-database-init/06-init-data-for-table.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)
