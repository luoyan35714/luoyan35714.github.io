---
layout: post
title:  Spring Boot学习笔记(十九) - 使用SQL数据库
date:   2017-07-06 17:09:00 +0800
categories: Spring Boot
tag: 教程
---

* content
{:toc}


Spring框架为使用SQL数据库提供了广泛支持，从使用 JdbcTemplate 直接访问JDBC到完全的`对象关系映射(ORM)`技术，比如Hibernate。Spring Data提供了更高级的功能，直接从接口创建 Repository 实现，并根据约定从方法名生成查询。


配置DataSource
==================

Java的 javax.sql.DataSource 接口提供了一个标准的使用数据库连接的方法。通常，DataSource使用 URL 和相应的凭证去初始化数据库连接。

对内嵌数据库的支持
------------------

开发应用时使用内存数据库是很方便的。显然，内存数据库不提供持久化存储；只需要在应用启动时填充数据库，在应用结束前预先清除数据。Spring Boot可以自动配置的内嵌数据库包括H2, HSQL和Derby。不需要提供任何连接URLs，只需要添加想使用的内嵌数据库依赖。

示例：典型的POM依赖如下：

{% highlight xml %}
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.hsqldb</groupId>
    <artifactId>hsqldb</artifactId>
    <scope>runtime</scope>
</dependency>
{% endhighlight %}

> 注 对于自动配置的内嵌数据库，需要添加 `spring-jdbc` 依赖，在本示例中， `spring-boot-starter-data-jpa` 已包含该依赖了。

> 无论出于什么原因，需要配置内嵌数据库的连接URL，一定要确保数据库的自动关闭是禁用的。如果使用H2，需要设置 `DB_CLOSE_ON_EXIT=FALSE` 。如果使用HSQLDB，需要确保没使用 `shutdown=true` 。禁用数据库的自动关闭可以让Spring Boot控制何时关闭数据库，因此在数据库不需要时可以确保关闭只发生一次。

连接生产环境数据库
------------------

生产环境的数据库连接可以通过池化的 DataSource 进行自动配置，下面是选取特定实现的算法：

+ 出于tomcat数据源连接池的优秀性能和并发，如果可用总会优先使用它。
+ 如果HikariCP可用，我们将使用它。
+ 如果Commons DBCP可用，我们将使用它，但生产环境不推荐。
+ 最后，如果Commons DBCP2可用，我们将使用它。

如果使用 `spring-boot-starter-jdbc` 或 `spring-boot-starter-data-jpa` 'starters'，会自动添加 `tomcat-jdbc` 依赖。

> 注 通过指定 `spring.datasource.type` 属性，可以完全抛弃该算法，然后指定数据库连接池。如果在tomcat容器中运行应用，由于默认提供 tomcat-jdbc ，这就很重要了。

> 注 其他的连接池可以手动配置，如果定义自己的 `DataSource` bean，自动配置是不会发生的。

DataSource配置被外部的 `spring.datasource.*` 属性控制，例如，可能会在 `application.properties` 中声明以下片段：

{% highlight text %}
spring.datasource.url=jdbc:mysql://localhost/test
spring.datasource.username=dbuser
spring.datasource.password=dbpass
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
{% endhighlight %}

> 注 应该至少使用 `spring.datasource.url` 属性指定url，或Spring Boot尝试自动配置内嵌数据库。

> 注 通常不需要指定 `driver-class-name` ，因为Spring boot可以从 `url` 推断大部分数据库。

> 注 对于将要创建的池化 `DataSource` ，我们需要验证是否有一个可用的 `Driver` ，所以在做其他事前会校验它。比如，如果设置 `spring.datasource.driver-class-name=com.mysql.jdbc.Driver` ，然后该class加载出来，否则就会出错。

其他可选配置可以查看[DataSourceProperties](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/jdbc/DataSourceProperties.java)，有些标准配置是跟实现无关的，对于实现相关的配置可以通过相应前缀进行设置（ `spring.datasource.tomcat.*` ， `spring.datasource.hikari.*` ， `spring.datasource.dbcp.*` 和 `spring.datasource.dbcp2.*` ），具体参考使用的连接池文档。

举例来说，如果正在使用Tomcat连接池，可以自定义很多其他设置：

{% highlight text %}
# Number of ms to wait before throwing an exception if no connection is available.
spring.datasource.tomcat.max-wait=10000

# Maximum number of active connections that can be allocated from this pool at the same time.
spring.datasource.tomcat.max-active=50

# Validate the connection before borrowing it from the pool.
spring.datasource.tomcat.test-on-borrow=true
{% endhighlight %}

连接JNDI数据库
------------------

如果正在将Spring Boot应用部署到一个应用服务器，我们可能想要用应用服务器内建的特性来配置和管理DataSource，并使用JNDI访问它。`spring.datasource.jndi-name` 属性可用来替代 `spring.datasource.url` ， `spring.datasource.username` 和 `spring.datasource.password` 去从一个特定的JNDI路径获取 `DataSource` ，比如，以下 `application.properties` 中的片段展示了如何获取JBoss AS定义的 `DataSource` ：

{% highlight text %}
spring.datasource.jndi-name=java:jboss/datasources/customers
{% endhighlight %}


使用JdbcTemplate
==================

Spring的 `JdbcTemplate` 和 `NamedParameterJdbcTemplate` 类会被自动配置，可以将它们直接 `@Autowire` 到自己的beans：

{% highlight java %}
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public MyBean(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ...

}
{% endhighlight %}


JPA和Spring Data
==================

Java持久化API是一个允许将对象映射为关系数据库的标准技术， `springboot-starter-data-jpa` POM提供了一种快速上手的方式，它提供以下关键依赖：

+ Hibernate - 一个非常流行的JPA实现。
+ Spring Data JPA - 让实现基于JPA的repositories更容易。
+ Spring ORMs - Spring框架支持的核心ORM。

> 注 更多关于JPA或Spring Data的细节。可以参考来自spring.io的指南使用[JPA获取数据](https://spring.io/guides/gs/accessing-data-jpa/)，并阅读Spring Data [JPA](http://projects.spring.io/spring-data-jpa/)和[Hibernate](http://hibernate.org/orm/documentation/)的参考文档。

> 注 Spring Boot默认使用Hibernate 5.0.x，如果希望的话也可以使用4.3.x或5.2.x，具体参考[Hibernate 4](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-samples/spring-boot-sample-hibernate4)和[Hibernate 5.2](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-samples/spring-boot-sample-hibernate52)示例。

实体类
------------------

通常，JPA实体类被定义到一个 `persistence.xml` 文件，在Spring Boot中，这个文件被`实体扫描`取代。默认情况，Spring Boot会查找主配置类（被 @EnableAutoConfiguration 或 @SpringBootApplication 注解的类）下的所有包。

任何被 `@Entity` ， `@Embeddable` 或 `@MappedSuperclass` 注解的类都将被考虑，一个普通的实体类看起来像这样：

{% highlight java %}
package com.example.myapp.domain;

import java.io.Serializable;
import javax.persistence.*;

@Entity
public class City implements Serializable {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String state;

    // ... additional members, often include @OneToMany mappings

    protected City() {
        // no-args constructor required by JPA spec
        // this one is protected since it shouldn't be used directly
    }

    public City(String name, String state) {
        this.name = name;
        this.country = country;
    }

    public String getName() {
        return this.name;
    }

    public String getState() {
        return this.state;
    }

    // ... etc

}
{% endhighlight %}

> 注 可以使用 `@EntityScan` 注解自定义实体扫描路径，具体参考[Section 74.4,“Separate @Entity definitions from Spring configuration”](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#howto-separate-entity-definitions-from-spring-configuration)。

Spring Data JPA仓库
------------------

Spring Data JPA仓库（repositories）是用来定义访问数据的接口。根据方法名，JPA查询会被自动创建，比如，一个 `CityRepository` 接口可能声明一个 `findAllByState(String state)` 方法，用来查找给定状态的所有城市。

对于比较复杂的查询，可以使用Spring Data的 [Query](http://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/repository/Query.html) 注解方法。

Spring Data仓库通常继承自 [Repository](http://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/repository/Repository.html) 或 [CrudRepository](http://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/repository/CrudRepository.html) 接口。如果使用
自动配置，Spring Boot会搜索主配置类（注
解 @EnableAutoConfiguration 或 @SpringBootApplication 的类）所在包下
的仓库。

下面是典型的Spring Data仓库：

{% highlight java %}
package com.example.myapp.domain;

import org.springframework.data.domain.*;
import org.springframework.data.repository.*;

public interface CityRepository extends Repository<City, Long> {

    Page<City> findAll(Pageable pageable);

    City findByNameAndCountryAllIgnoringCase(String name, String country);

}
{% endhighlight %}

注：更多详细细节参考[Spring Data JPA的参考指南](http://projects.spring.io/spring-data-jpa/)。

创建和删除JPA数据库
------------------

默认情况下，只有在使用内嵌数据库（H2, HSQL或Derby）时，JPA数据库才会被自动创建。可以使用 `spring.jpa.*` 属性显式的设置JPA，比如，将以下配置添加到 `application.properties` 中可以创建和删除表：

{% highlight text %}
spring.jpa.hibernate.ddl-auto=create-drop
{% endhighlight %}

> 注 Hibernate自己内部对创建，删除表支持的属性是 `hibernate.hbm2ddl.auto` 。可以使用 `spring.jpa.properties.*` （前缀在被添加到实体管理器之前会被去掉）设置Hibernate其他的native属性，比如： 

{% highlight text %}
spring.jpa.properties.hibernate.globally_quoted_identifiers=true
{% endhighlight %}

将传递 `hibernate.globally_quoted_identifiers` 到Hibernate实体管理器。

通常，DDL执行（或验证）被延迟到 `ApplicationContext` 启动后，这可以通过 `spring.jpa.generate-ddl` 标签控制，如果Hibernate自动配置被激活，那该标识就不会被使用，因为 `ddl-auto` 设置粒度更细。


使用H2的web控制台
==================

[H2数据库](http://www.h2database.com/)提供一个[基于浏览器的控制台](http://www.h2database.com/html/quickstart.html#h2_console)，Spring Boot可以自动配置。如果以下条件满足，则控制台会被自动配置：

+ 正在开发一个web应用。
+ 添加 com.h2database:h2 依赖。
+ 正在使用[Spring Boot开发者工具](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#using-boot-devtools)。

> 注 如果没有使用Spring Boot的开发者工具，仍想利用H2的控制台，可以设置 `spring.h2.console.enabled` 属性值为 `true` 。H2控制台应该只用于开发期间，所以确保生产环境没有设置 `spring.h2.console.enabled` 。

改变H2控制台路径
------------------

H2控制台路径默认为 `/h2-console` ，可以通过设置 `spring.h2.console.path` 属性自定义该路径。

保护H2控制台
------------------

当添加Spring Security依赖，并且启用基本认证时，Spring Boot自动使用基本认证保护H2控制台。以下属性可用于自定义安全配置：

+ `security.user.role`
+ `security.basic.authorize-mode`
+ `security.basic.enabled`


使用jOOQ
==================

Java面向对象查询（[jOOQ](http://www.jooq.org/)）是[Data Geekery](http://www.datageekery.com/)的一个明星产品，可以从数据库生成Java代码，通过它的流式API构建类型安全的SQL查询。不管是商业版，还是
开源版本都能跟Spring Boot一块使用。

代码生成
------------------

为了使用jOOQ的类型安全查询，需要从数据库Schema中生成Java类。具体可以参照[jOOQ的用户手册](http://www.jooq.org/doc/3.6/manual-single-page/#jooq-in-7-steps-step3)的操作指南。如果正在使用`jooq-codegen-maven`插件(并且使用`spring-boot-starter-parent` parent pom), 那么可以安全地省略插件的`<version>`标签。当然也可以使用Spring Boot来定义版本变量 (例如. `h2.version`)来声明插件的数据库依赖。

{% highlight xml %}
<plugin>
    <groupId>org.jooq</groupId>
    <artifactId>jooq-codegen-maven</artifactId>
    <executions>
        ...
    </executions>
    <dependencies>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <version>${h2.version}</version>
        </dependency>
    </dependencies>
    <configuration>
        <jdbc>
            <driver>org.h2.Driver</driver>
            <url>jdbc:h2:~/yourdatabase</url>
        </jdbc>
        <generator>
            ...
        </generator>
    </configuration>
</plugin>
{% endhighlight %}

使用 DSLContext
------------------

jOOQ提供的fluent API是通过 `org.jooq.DSLContext` 接口初始化的。Spring Boot会自动配置一个作为Spring Bean的`DSLContext`，并且连接到应用程序`DataSource`，想要使用`DSLContext`就只需要`@Autowire`就可以了。

{% highlight java %}
@Component
public class JooqExample implements CommandLineRunner {

    private final DSLContext create;

    @Autowired
    public JooqExample(DSLContext dslContext) {
        this.create = dslContext;
    }

}
{% endhighlight %}

>  jOOQ 指南中使用了一个名为`create`的变量来存储DSLContext, 以上例子是相同的。

接下来就可以通过`DSLContext`来构建相关查询了：

{% highlight java %}
public List<GregorianCalendar> authorsBornAfter1980() {
    return this.create.selectFrom(AUTHOR)
        .where(AUTHOR.DATE_OF_BIRTH.greaterThan(new GregorianCalendar(1980, 0, 1)))
        .fetch(AUTHOR.DATE_OF_BIRTH);
}
{% endhighlight %}

Customizing jOOQ
------------------

jOOQ可以通过在`application.properties`中设置`spring.jooq.sql-dialect`来定制化SQL dialect。例如，想要指定为`Postgres`可以添加：

{% highlight text %}
spring.jooq.sql-dialect=Postgres
{% endhighlight %}

在jOOQ在创建的时候，可以通过定义自己的`@Bean`定义来实现更多高级的定制化操作。可以为如下的jOOQ类型定义beans:

+ ConnectionProvider
+ TransactionProvider
+ RecordMapperProvider
+ RecordListenerProvider
+ ExecuteListenerProvider
+ VisitListenerProvider

可以通过创建自己的`org.jooq.Configuration` `@Bean`来获取完整的jOOQ配置控制权。

实验
==================

> 本实验基于内嵌H2数据库进行。

创建一个Maven项目
------------------

![/images/blog/spring-boot/19-data-access-sql-database/01-new-maven-project.png](/images/blog/spring-boot/19-data-access-sql-database/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.freud.test</groupId>
    <artifactId>spring-boot-19</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>spring-boot-19</name>
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
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
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
    name: test-19
  jpa:
    show-sql: true
server:
  port: 9090
{% endhighlight %}

User.java
------------------

{% highlight java %}
package com.freud.test.springboot.bean;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * @author Freud
 */
@Entity
public class User {

    @Id
    private long id;

    @Column
    private String name;

    @Column
    private int age;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

}
{% endhighlight %}

UserController.java
------------------

{% highlight java %}
package com.freud.test.springboot.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.freud.test.springboot.bean.User;
import com.freud.test.springboot.repository.UserRepository;

/**
 * @author Freud
 */
@RestController
@RequestMapping("/users")
public class UserController {

    private static final String RESULT_SUCCESS = "success";
    private static final String RESULT_FAILED = "failed";

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/all")
    public List<User> all() {
        return userRepository.findAll();
    }

    @GetMapping("/find")
    public User find(Long id) {
        return userRepository.findOne(id);
    }

    @GetMapping("/save")
    public String save(User user) {
        try {
            userRepository.save(user);
            return RESULT_SUCCESS;
        } catch (Exception e) {
            e.printStackTrace();
            return RESULT_FAILED;
        }
    }

    @GetMapping("/delete")
    public String delete(long id) {
        try {
            userRepository.delete(id);
            return RESULT_SUCCESS;
        } catch (Exception e) {
            e.printStackTrace();
            return RESULT_FAILED;
        }
    }
}
{% endhighlight %}

UserRepository.java
------------------

{% highlight java %}
package com.freud.test.springboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.freud.test.springboot.bean.User;

/**
 * @author Freud
 */
public interface UserRepository extends JpaRepository<User, Long> {

}
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

![/images/blog/spring-boot/19-data-access-sql-database/02-project-hierarchy.png](/images/blog/spring-boot/19-data-access-sql-database/02-project-hierarchy.png)


运行结果
==================

访问`http://localhost:9090/users/all`，查看所有的用户列表：

![/images/blog/spring-boot/19-data-access-sql-database/03-run-result-all.png](/images/blog/spring-boot/19-data-access-sql-database/03-run-result-all.png)

通过浏览器的GET请求添加一个ID为1的用户`http://localhost:9090/users/save?id=1&name=freud&age=29`和一个ID为2的用户`http://localhost:9090/users/save?id=2&name=kang&age=30`：

![/images/blog/spring-boot/19-data-access-sql-database/04-run-result-add-01.png](/images/blog/spring-boot/19-data-access-sql-database/04-run-result-add-01.png)

![/images/blog/spring-boot/19-data-access-sql-database/05-run-result-add-02.png](/images/blog/spring-boot/19-data-access-sql-database/05-run-result-add-02.png)

访问`http://localhost:9090/users/all`，查看所有的用户列表：

![/images/blog/spring-boot/19-data-access-sql-database/06-run-result-all.png](/images/blog/spring-boot/19-data-access-sql-database/06-run-result-all.png)

通过ID查看用户信息`http://localhost:9090/users/find?id=1`:

![/images/blog/spring-boot/19-data-access-sql-database/07-run-result-find-by-id.png](/images/blog/spring-boot/19-data-access-sql-database/07-run-result-find-by-id.png)

通过ID删除用户信息`http://localhost:9090/users/delete?id=1`:

![/images/blog/spring-boot/19-data-access-sql-database/08-run-result-delete.png](/images/blog/spring-boot/19-data-access-sql-database/08-run-result-delete.png)

访问`http://localhost:9090/users/all`，查看所有的用户列表：

![/images/blog/spring-boot/19-data-access-sql-database/09-run-result-all.png](/images/blog/spring-boot/19-data-access-sql-database/09-run-result-all.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)
