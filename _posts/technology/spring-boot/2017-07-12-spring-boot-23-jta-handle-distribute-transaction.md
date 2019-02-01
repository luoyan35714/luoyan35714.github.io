---
layout: post
title:  Spring Boot(二三) - 使用JTA处理分布式事务
date:   2017-07-12 09:08:00 +0800
categories: Spring-Boot
tag: 教程
---

* content
{:toc}


使用JTA处理分布式事务
==================

Spring Boot通过[Atomkos](http://www.atomikos.com/)或[Bitronix](https://github.com/bitronix/btm)的内嵌事务管理器支持跨多个XA资源的分布式JTA事务，当部署到恰当的J2EE应用服务器时也会支持JTA事务。

当发现JTA环境时，Spring Boot将使用Spring的 `JtaTransactionManager` 来管理事务。自动配置的JMS，DataSource和JPA　beans将被升级以支持XA事务。可以使用标准的Spring idioms，比如 `@Transactional` ，来参与到一个分布式事务中。如果处于JTA环境，但仍想使用本地事务，你可以将 `spring.jta.enabled` 属性设置为 `false` 来禁用JTA自动配置功能。

使用Atomikos事务管理器
------------------

Atomikos是一个非常流行的开源事务管理器，并且可以嵌入到Spring Boot应用中。可以使用 `spring-boot-starter-jta-atomikos` Starter去获取正确的Atomikos库。Spring Boot会自动配置Atomikos，并将合适的 `depends-on` 应用到Spring Beans上，确保它们以正确的顺序启动和关闭。

默认情况下，Atomikos事务日志将被记录在应用home目录（应用jar文件放置的目录）下的 `transaction-logs` 文件夹中。可以在 `application.properties` 文件中通过设置 `spring.jta.log-dir` 属性来定义该目录，以 `spring.jta.atomikos.properties` 开头的属性能用来定义Atomikos的 `UserTransactionServiceIml` 实现，具体参考[AtomikosProperties javadoc](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/api/org/springframework/boot/jta/atomikos/AtomikosProperties.html)。

> 注 为了确保多个事务管理器能够安全地和相应的资源管理器配合，每个Atomikos实例必须设置一个唯一的ID。默认情况下，该ID是Atomikos实例运行的机器上的IP地址。为了确保生产环境中该ID的唯一性，需要为应用的每个实例设置不同的 `spring.jta.transaction-manager-id` 属性值。

使用Bitronix事务管理器
------------------

Bitronix是一个流行的开源JTA事务管理器实现，可以使用 ·spring-bootstarter-jta-bitronix· starter为项目添加合适的Birtronix依赖。和Atomikos类似，Spring Boot将自动配置Bitronix，并对beans进行后处理（post-process）以确保它们以正确的顺序启动和关闭。

默认情况下，Bitronix事务日志（ `part1.btm` 和 `part2.btm` ）将被记录到应用home目录下的 `transaction-logs` 文件夹中，可以通过设置 `spring.jta.log-dir` 属性来自定义该目录。以 `spring.jta.bitronix.properties` 开头的属性将被绑定到 `bitronix.tm.Configuration` bean，可以通过这完成进一步的自定义，具体参考[Bitronix文档](https://github.com/bitronix/btm/wiki/Transaction-manager-configuration)。

> 注 为了确保多个事务管理器能够安全地和相应的资源管理器配合，每个Bitronix实例必须设置一个唯一的ID。默认情况下，该ID是Bitronix实例运行的机器上的IP地址。为了确保生产环境中该ID的唯一性，需要为应用的每个实例设置不同的 `spring.jta.transaction-manager-id` 属性值。

使用Narayana事务管理器
------------------

Narayana是一个流行的开源JTA事务管理器实现，目前只有JBoss支持。可以使用 `spring-boot-starter-jta-narayana` starter添加合适的Narayana依赖，像Atomikos和Bitronix那样，Spring Boot将自动配置Narayana，并对beans后处理（post-process）以确保正确启动和关闭。

Narayana事务日志默认记录到应用home目录（放置应用jar的目录）的 `transaction-logs` 目录下，可以通过设置 `application.properties` 中的 `spring.jta.log-dir` 属性自定义该目录。以 `spring.jta.narayana.properties` 开头的属性可用于自定义Narayana配置，具体参考[NarayanaProperties](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/api/org/springframework/boot/jta/narayana/NarayanaProperties.html)。

> 注 为了确保多事务管理器能够安全配合相应资源管理器，每个Narayana实例必须配置唯一的ID，默认ID设为 1 。为确保生产环境中ID唯一性，可以为应用的每个实例配置不同的 `spring.jta.transaction-manager-id` 属性值。

使用J2EE管理的事务管理器
------------------

如果将Spring Boot应用打包为一个 `war` 或 `ear` 文件，并将它部署到一个J2EE的应用服务器中，那就能使用应用服务器内建的事务管理器。Spring Boot将尝试通过查找常见的JNDI路径（ `java:comp/UserTransaction` ,`java:comp/TransactionManager` 等）来自动配置一个事务管理器。如果使用应用服务器提供的事务服务，通常需要确保所有的资源都被应用服务器管理，并通过JNDI暴露出去。Spring Boot通过查找JNDI路径 `java:/JmsXA` 或 `java:/XAConnectionFactory` 获取一个 `ConnectionFactory` 来自动配置JMS，并且可以使用 `spring.datasource.jndi-name` 属性配置 `DataSource` 。

混合XA和non-XA的JMS连接
------------------

当使用JTA时，primary JMS `ConnectionFactory` bean将能识别XA，并参与到分布式事务中。有些情况下，可能需要使用non-XA的 `ConnectionFactory` 去处理一些JMS消息。例如，JMS处理逻辑可能比XA超时时间长。

如果想使用一个non-XA的 `ConnectionFactory` ，可以注入 `nonXaJmsConnectionFactory` bean而不是 `@Primary``jmsConnectionFactory` bean。为了保持一致， `jmsConnectionFactory` bean将以别名 `xaJmsConnectionFactor` 来被使用。

示例如下：

{% highlight java %}
// Inject the primary (XA aware) ConnectionFactory
@Autowired
private ConnectionFactory defaultConnectionFactory;

// Inject the XA aware ConnectionFactory (uses the alias and injects the same as above)
@Autowired
@Qualifier("xaJmsConnectionFactory")
private ConnectionFactory xaConnectionFactory;

// Inject the non-XA aware ConnectionFactory
@Autowired
@Qualifier("nonXaJmsConnectionFactory")
private ConnectionFactory nonXaConnectionFactory;
{% endhighlight %}

支持可替代的内嵌事务管理器
------------------

[XAConnectionFactoryWrapper](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot/src/main/java/org/springframework/boot/jta/XAConnectionFactoryWrapper.java)和[XADataSourceWrapper](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot/src/main/java/org/springframework/boot/jta/XADataSourceWrapper.java)接口用于支持可替换的内嵌事务管理器。该接口用于包装 `XAConnectionFactory` 和 `XADataSource` beans，并将它们暴露为普通的 `ConnectionFactory` 和 `DataSource` beans，这样在分布式事务中可以透明使用。Spring Boot将使用注册到 `ApplicationContext` 的合适的XA包装器及 `JtaTransactionManager` bean自动配置DataSource和JMS。

[BitronixXAConnectionFactoryWrapper](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot/src/main/java/org/springframework/boot/jta/bitronix/BitronixXAConnectionFactoryWrapper.java)和[BitronixXADataSourceWrapper](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot/src/main/java/org/springframework/boot/jta/bitronix/BitronixXADataSourceWrapper.java)提供了很好
的示例用于演示怎么编写XA包装器。


实验
==================

> 本实验基于Atomikos事务管理器和MYSQL数据库实现。

创建数据库
------------------

{% highlight sql %}
DROP DATABASE IF EXISTS `jta-income`;

CREATE DATABASE `jta-income`;

USE `jta-income`;

DROP TABLE IF EXISTS `income`;

CREATE TABLE `income` (
  `id` INT(20) NOT NULL AUTO_INCREMENT,
  `userId` INT(20) NOT NULL,
  `amount` FLOAT(8,2) NOT NULL,  
  `operateDate` DATETIME  NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;

DROP DATABASE IF EXISTS `jta-user`;

CREATE DATABASE `jta-user`;

USE `jta-user`;

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` INT(20) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;
{% endhighlight %}

创建一个Maven项目
------------------

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/01-new-maven-project.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.freud.test</groupId>
    <artifactId>spring-boot-23</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>spring-boot-23</name>
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
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jta-atomikos</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>1.0.0</version>
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
    name: test-23
  jpa:
    show-sql: true
  jta:
    enabled: true
    atomikos:
      datasource:
        jta-user:
          xa-properties.url: jdbc:mysql://localhost:3306/jta-user
          xa-properties.user: root
          xa-properties.password: root
          xa-data-source-class-name: com.mysql.jdbc.jdbc2.optional.MysqlXADataSource
          unique-resource-name: jta-user
          max-pool-size: 25
          min-pool-size: 3
          max-lifetime: 20000
          borrow-connection-timeout: 10000
        jta-income: 
          xa-properties.url: jdbc:mysql://localhost:3306/jta-income
          xa-properties.user: root
          xa-properties.password: root
          xa-data-source-class-name: com.mysql.jdbc.jdbc2.optional.MysqlXADataSource
          unique-resource-name: jta-income
          max-pool-size: 25
          min-pool-size: 3
          max-lifetime: 20000
          borrow-connection-timeout: 10000
server:
  port: 9090
{% endhighlight %}

UserMapper.xml
------------------

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
PUBLIC "-//ibatis.apache.org//DTD Mapper 3.0//EN"
"http://ibatis.apache.org/dtd/ibatis-3-mapper.dtd">
<mapper namespace="com.freud.test.springboot.mapper.user.UserMapper">
    
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO USER 
        (   
            NAME
        )
        VALUES
        (
            #{name}
        )
    </insert>
    
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

}
{% endhighlight %}

Income.java
------------------

{% highlight java %}
package com.freud.test.springboot.bean;

import java.sql.Timestamp;

/**
 * @author Freud
 */
public class Income {

    private long id;
    private long userId;
    private double amount;
    private Timestamp operateDate;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public Timestamp getOperateDate() {
        return operateDate;
    }

    public void setOperateDate(Timestamp operateDate) {
        this.operateDate = operateDate;
    }

}
{% endhighlight %}

DataSourceJTAIncomeConfig.java
------------------

{% highlight java %}
package com.freud.test.springboot.config;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.atomikos.jdbc.AtomikosDataSourceBean;

/**
 * @author Freud
 */
@Configuration
@EnableConfigurationProperties
@EnableAutoConfiguration
@MapperScan(basePackages = "com.freud.test.springboot.mapper.income", sqlSessionTemplateRef = "jtaIncomeSqlSessionTemplate")
public class DataSourceJTAIncomeConfig {

    @Bean
    @ConfigurationProperties(prefix = "spring.jta.atomikos.datasource.jta-income")
    public DataSource dataSourceJTAIncome() {
        return new AtomikosDataSourceBean();
    }

    @Bean
    public SqlSessionFactory jtaIncomeSqlSessionFactory(@Qualifier("dataSourceJTAIncome") DataSource dataSource)
            throws Exception {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        bean.setDataSource(dataSource);
        bean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mapper/*.xml"));
        bean.setTypeAliasesPackage("com.freud.test.springboot.mapper.income");
        return bean.getObject();
    }

    @Bean
    public SqlSessionTemplate jtaIncomeSqlSessionTemplate(
            @Qualifier("jtaIncomeSqlSessionFactory") SqlSessionFactory sqlSessionFactory) throws Exception {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
{% endhighlight %}

DataSourceJTAUserConfig.java
------------------

{% highlight java %}
package com.freud.test.springboot.config;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.atomikos.jdbc.AtomikosDataSourceBean;

@Configuration
@EnableConfigurationProperties
@EnableAutoConfiguration
@MapperScan(basePackages = "com.freud.test.springboot.mapper.user", sqlSessionTemplateRef = "jtaUserSqlSessionTemplate")
public class DataSourceJTAUserConfig {

    @Bean
    @ConfigurationProperties(prefix = "spring.jta.atomikos.datasource.jta-user")
    @Primary
    public DataSource dataSourceJTAUser() {
        return new AtomikosDataSourceBean();
    }

    @Bean
    @Primary
    public SqlSessionFactory jtaUserSqlSessionFactory(@Qualifier("dataSourceJTAUser") DataSource dataSource)
            throws Exception {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        bean.setDataSource(dataSource);
        bean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mapper/*.xml"));
        bean.setTypeAliasesPackage("com.freud.test.springboot.mapper.user");
        return bean.getObject();
    }

    @Bean
    @Primary
    public SqlSessionTemplate jtaUserSqlSessionTemplate(
            @Qualifier("jtaUserSqlSessionFactory") SqlSessionFactory sqlSessionFactory) throws Exception {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
{% endhighlight %}

IncomeController.java
------------------

{% highlight java %}
package com.freud.test.springboot.controller;

import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.freud.test.springboot.bean.Income;
import com.freud.test.springboot.bean.User;
import com.freud.test.springboot.mapper.income.IncomeMapper;
import com.freud.test.springboot.mapper.user.UserMapper;

/**
 * @author Freud
 */
@RestController
@RequestMapping("/income")
public class IncomeController {

    public static final String RESULT_SUCCESS = "success";
    public static final String RESULT_FAILED = "failed";

    @Autowired
    private IncomeMapper incomeMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/addincome/1")
    @Transactional
    public String addIncome1(@RequestParam("name") String name, @RequestParam("amount") double amount) {

        try {
            User user = new User();
            user.setName(name);
            userMapper.insert(user);

            Income income = new Income();
            income.setUserId(user.getId());
            income.setAmount(amount);
            income.setOperateDate(new Timestamp(System.currentTimeMillis()));
            incomeMapper.insert(income);

            return RESULT_SUCCESS;
        } catch (Exception e) {
            e.printStackTrace();
            return RESULT_FAILED + ":" + e.getMessage();
        }
    }

    @GetMapping("/addincome/2")
    @Transactional
    public String addIncome2(@RequestParam("name") String name, @RequestParam("amount") double amount) {
        try {
            User user = new User();
            user.setName(name);
            userMapper.insert(user);

            this.throwRuntimeException();

            Income income = new Income();
            income.setUserId(user.getId());
            income.setAmount(amount);
            income.setOperateDate(new Timestamp(System.currentTimeMillis()));
            incomeMapper.insert(income);

            return RESULT_SUCCESS;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
            // return RESULT_FAILED + ":" + e.getMessage();
        }
    }

    public void throwRuntimeException() {
        throw new RuntimeException("User defined exceptions");
    }
}
{% endhighlight %}

IncomeMapper.java
------------------

{% highlight java %}
package com.freud.test.springboot.mapper.income;

import org.apache.ibatis.annotations.Insert;

import com.freud.test.springboot.bean.Income;

/**
 * @author Freud
 */
public interface IncomeMapper {

    @Insert("INSERT INTO INCOME(userId,amount,operateDate) VALUES(#{userId},#{amount},#{operateDate})")
    public void insert(Income income);

}
{% endhighlight %}

UserMapper.java
------------------

{% highlight java %}
package com.freud.test.springboot.mapper.user;

import com.freud.test.springboot.bean.User;

/**
 * @author Freud
 */
public interface UserMapper {

    public void insert(User user);

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

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/02-project-hierarchy.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/02-project-hierarchy.png)

运行及结果
==================

查看表中数据
------------------

首先先看下两个数据库中表的情况：

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/03-databases.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/03-databases.png)

`user`库中user表的数据情况如下：

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/04-database-income.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/04-database-income.png) 

`income`库中income表的数据情况如下：

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/05-database-user.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/05-database-user.png)

事务正常
------------------

访问`http://localhost:9090/income/addincome/1?name=freud&amount=10`，正常在两个数据库各插入一条数据。

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/06-result-normal.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/06-result-normal.png)

`user`库中user表的数据情况如下：

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/07-result-database-user.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/07-result-database-user.png)

`income`库中income表的数据情况如下：

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/08-result-database-income.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/08-result-database-income.png)

事务失败
------------------

访问`http://localhost:9090/income/addincome/2?name=kkk&amount=10`，程序中会抛出一个运行时异常，事务失败，两个库都不会插入数据成功。

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/09-result-failed.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/09-result-failed.png)

`user`库中user表的数据情况如下：

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/10-result-database-user.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/10-result-database-user.png)

`income`库中income表的数据情况如下：

![/images/blog/spring-boot/23-jta-handle-distribute-transaction/11-result-database-income.png](/images/blog/spring-boot/23-jta-handle-distribute-transaction/11-result-database-income.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

Spring-boot下的mybatis多数据源JTA配置 : [http://blog.csdn.net/pichunhan/article/details/70846695](http://blog.csdn.net/pichunhan/article/details/70846695)

JTA 深度历险 - 原理与实现 : [https://www.ibm.com/developerworks/cn/java/j-lo-jta/](https://www.ibm.com/developerworks/cn/java/j-lo-jta/)