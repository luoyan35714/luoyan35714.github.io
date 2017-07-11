---
layout: post
title:  Spring Boot学习笔记(二二) - 与Mybatis集成
date:   2017-07-11 16:10:00 +0800
categories: Spring Boot
tag: 教程
---

* content
{:toc}


> 本文文档部分基本转载自[Spring Boot 集成MyBatis](http://blog.csdn.net/isea533/article/details/50359390)

与Mybatis集成
==================

Spring Boot中的JPA部分默认是使用的hibernate，而如果想使用Mybatis的话就需要自己做一些配置。使用方式有两种，第一种是Mybatis官方提供的 `mybatis-spring-boot-starter` ，第二种是类似 `mybatis-spring`的方式，需要自己写一些代码。但是可以更方便地控制Mybatis的各项配置。

mybatis-spring-boot-starter
------------------

这种方式只需要在application.properties中配置相关的Mybatis属性就可以了。数据源使用的是Spring Boot默认的数据源

{% highlight text %}
mybatis.mapperLocations: mapper配置文件的路径，支持通配符方式
mybatis.typeAliasesPackage: 用来扫描Entity的包
mybatis.config：mybatis-config.xml配置文件的路径
mybatis.typeHandlersPackage：扫描typeHandlers的包
mybatis.checkConfigLocation：检查配置文件是否存在
mybatis.executorType：设置执行模式（SIMPLE, REUSE, BATCH），默认为SIMPLE
{% endhighlight %}

mybatis-spring方式
------------------

这种方式和平常的用法比较接近。需要添加mybatis依赖和mybatis-spring依赖。然后创建一个`MyBatisConfig`配置类：

{% highlight java %}
package com.freud.test.springboot;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.TransactionManagementConfigurer;

/**
 * MyBatis基础配置
 *
 * @author Freud
 */
@Configuration
@EnableTransactionManagement
public class MybatisConfig implements TransactionManagementConfigurer {

    @Autowired
    private DataSource dataSource;

    @Bean(name = "sqlSessionFactory")
    public SqlSessionFactory sqlSessionFactoryBean() {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        bean.setDataSource(dataSource);
        bean.setTypeAliasesPackage("com.freud.test.springboot");

        // 添加XML目录
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        try {
            bean.setMapperLocations(resolver.getResources("classpath:mapper/*.xml"));
            return bean.getObject();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    @Bean
    public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    @Bean
    public PlatformTransactionManager annotationDrivenTransactionManager() {
        return new DataSourceTransactionManager(dataSource);
    }
}
{% endhighlight %}

上面代码创建了一个`SqlSessionFactory`和一个`SqlSessionTemplate`，为了支持注解事务，增加了`@EnableTransactionManagement`注解，并且反回了一个`PlatformTransactionManagerBean`。

另外如果想要扫描MyBatis的Mapper接口, 就需要配置MapperScannerConfigurer。

{% highlight java %}
package com.freud.test.springboot;

import org.mybatis.spring.mapper.MapperScannerConfigurer;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis扫描接口
 * 
 * @author Freud
 */
@Configuration
// 注意，由于MapperScannerConfigurer执行的比较早，所以必须有下面的注解
@AutoConfigureAfter(MybatisConfig.class)
public class MyBatisMapperScannerConfig {

    @Bean
    public MapperScannerConfigurer mapperScannerConfigurer() {
        MapperScannerConfigurer mapperScannerConfigurer = new MapperScannerConfigurer();
        mapperScannerConfigurer.setSqlSessionFactoryBeanName("sqlSessionFactory");
        mapperScannerConfigurer.setBasePackage("com.freud.test.springboot.mapper");
        return mapperScannerConfigurer;
    }

}
{% endhighlight %}


实验
==================

> 本实验使用mybatis-spring-boot-starter方式。

创建一个Maven项目
------------------

![/images/blog/spring-boot/22-integrate-with-mybatis/01-new-maven-project.png](/images/blog/spring-boot/22-integrate-with-mybatis/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.freud.test</groupId>
    <artifactId>spring-boot-22</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>spring-boot-22</name>
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
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>1.0.0</version>
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
    name: test-22
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
mybatis: 
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.freud.test.springboot
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

UserMapper.xml
------------------

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
PUBLIC "-//ibatis.apache.org//DTD Mapper 3.0//EN"
"http://ibatis.apache.org/dtd/ibatis-3-mapper.dtd">
<mapper namespace="com.freud.test.springboot.mapper.UserMapper">

    <resultMap id="user" type="com.freud.test.springboot.bean.User">
        <id property="id" jdbcType="INTEGER" column="ID"/>
        <result property="name" jdbcType="VARCHAR" column="NAME"/>
        <result property="age" jdbcType="INTEGER" column="AGE"/>
    </resultMap>
    
    <select id="getById" resultMap="user">
        SELECT 
            ID,
            NAME,
            AGE
        FROM USER
        WHERE ID = #{id}
    </select>
    
    <insert id="insert">
        INSERT INTO USER 
        (   
            NAME,
            AGE
        )
        VALUES
        (
            #{name},
            #{age}
        )
    </insert>
    
    <delete id="delete">
        DELETE FROM USER
        WHERE ID = #{id}
    </delete>
    
</mapper>
{% endhighlight %}

User.java
------------------

{% highlight java %}
package com.freud.test.springboot.bean;

/**
 * @author Freud
 */
public class User {

    private long id;
    private String name;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.freud.test.springboot.bean.User;
import com.freud.test.springboot.mapper.UserMapper;

/**
 * @author Freud
 */
@RestController
@RequestMapping("/user")
public class UserController {

    public static final String RESULT_SUCCESS = "success";
    public static final String RESULT_FAILED = "failed";

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/all")
    public List<User> all() {
        return userMapper.getAll();
    }

    @GetMapping("/find")
    public User find(@RequestParam("id") long id) {
        return userMapper.getById(id);
    }

    @GetMapping("/save")
    public String save(User user) {
        try {
            userMapper.insert(user);
            return RESULT_SUCCESS;
        } catch (Exception e) {
            return RESULT_FAILED;
        }
    }

    @GetMapping("/delete")
    public String delete(@RequestParam("id") long id) {
        try {
            userMapper.delete(id);
            return RESULT_SUCCESS;
        } catch (Exception e) {
            return RESULT_FAILED;
        }
    }
}
{% endhighlight %}

UserMapper.java
------------------

{% highlight java %}
package com.freud.test.springboot.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import com.freud.test.springboot.bean.User;

/**
 * @author Freud
 */
public interface UserMapper {

    @Select("SELECT * FROM USER")
    public List<User> getAll();

    public User getById(@Param("id") long id);

    public void insert(User user);

    public void delete(@Param("id") long id);
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

![/images/blog/spring-boot/22-integrate-with-mybatis/02-project-hierarchy.png](/images/blog/spring-boot/22-integrate-with-mybatis/02-project-hierarchy.png)


运行及结果
==================

访问`http://localhost:9090/user/all`，查看所有的用户列表：

03-explorer-result-all.png
![/images/blog/spring-boot/22-integrate-with-mybatis/03-run-result-all.png](/images/blog/spring-boot/22-integrate-with-mybatis/03-run-result-all.png)

通过浏览器的Get请求创建一个新的用户`http://localhost:9090/user/save?name=kang&age=30`

![/images/blog/spring-boot/22-integrate-with-mybatis/04-explorer-result-add.png](/images/blog/spring-boot/22-integrate-with-mybatis/04-explorer-result-add.png)

重新访问`http://localhost:9090/user/all`，查看所有的用户列表：

![/images/blog/spring-boot/22-integrate-with-mybatis/05-explorer-result-all.png](/images/blog/spring-boot/22-integrate-with-mybatis/05-explorer-result-all.png)

通过ID查询某个用户信息`http://localhost:9090/user/find?id=2`：

![/images/blog/spring-boot/22-integrate-with-mybatis/06-explorer-result-find-by-id.png](/images/blog/spring-boot/22-integrate-with-mybatis/06-explorer-result-find-by-id.png)

通过ID删除某个用户信息`http://localhost:9090/user/delete?id=1`

![/images/blog/spring-boot/22-integrate-with-mybatis/07-explorer-result-remove.png](/images/blog/spring-boot/22-integrate-with-mybatis/07-explorer-result-remove.png)

重新访问`http://localhost:9090/user/all`，查看所有的用户列表：

![/images/blog/spring-boot/22-integrate-with-mybatis/08-explorer-result-all.png](/images/blog/spring-boot/22-integrate-with-mybatis/08-explorer-result-all.png)


参考资料
==================

Spring Boot 集成MyBatis : [Spring Boot 集成MyBatis](http://blog.csdn.net/isea533/article/details/50359390)

[基于SpringBoot + Mybatis实现SpringMVC Web项目【原创】](http://7player.cn/2015/08/30/%E3%80%90%E5%8E%9F%E5%88%9B%E3%80%91%E5%9F%BA%E4%BA%8Espringboot-mybatis%E5%AE%9E%E7%8E%B0springmvc-web%E9%A1%B9%E7%9B%AE/)