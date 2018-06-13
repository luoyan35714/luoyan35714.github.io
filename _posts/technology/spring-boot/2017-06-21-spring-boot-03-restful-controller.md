---
layout: post
title:  Spring Boot学习笔记(三) - RESTful Controller
date:   2017-06-21 09:52:00 +0800
categories: Spring-Boot
tag: 教程
---

* content
{:toc}


RESTful定义
==================

REST这个词，是Roy Thomas Fielding在他2000年的博士论文中提出的。Fielding将他对互联网软件的架构原则，定名为REST，即Representational State Transfer的缩写，翻译为"表现层状态转化"。如果一个架构符合REST原则，就称它为RESTful架构。

根据[阮一峰博客](http://www.ruanyifeng.com/blog/2011/09/restful.html)中对Fielding论文定义中的总结,满足如下条件即可认为是RESTful架构：

+ 每一个URI代表一种资源；
+ 客户端和服务器之间，传递这种资源的某种表现层；
+ 客户端通过四个HTTP动词，对服务器端资源进行操作，实现"表现层状态转化"。


Spring Boot
==================

创建一个Maven项目
------------------

![/images/blog/spring-boot/03-restful-controller/01-new-maven-project.png](/images/blog/spring-boot/03-restful-controller/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-02</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-02</name>
	<url>http://maven.apache.org</url>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
	</dependencies>
	<dependencyManagement>
		<dependencies>
			<dependency>
				<!-- Import dependency management from Spring Boot -->
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

src/main/resources/application.properties
------------------

{% highlight text %}
spring.application.name=test-02
server.port= 9091
{% endhighlight %}

src/main/java/com.freud.springboot.App
------------------

{% highlight java %}
package com.freud.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Freud
 */
@SpringBootApplication
@RestController
@RequestMapping(value = "/freud/echo")
public class App {

	@GetMapping(value = "/hello")
	public String hello() {
		return "hello";
	}

	@RequestMapping(value = "/hi", method = RequestMethod.GET)
	public String hi() {
		return "hi";
	}

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/03-restful-controller/02-project-hierarchy.png](/images/blog/spring-boot/03-restful-controller/02-project-hierarchy.png)

运行及结果
------------------

通过main函数的方式运行App类。并在浏览器中依次打开`http://localhost:9091/freud/echo/hi`和`http://localhost:9091/freud/echo/hello`。

代码分析
------------------

其中`@GetMapping`注解是Spring 4.3之后出现的组合注解，作用与`@RequestMapping(value = "/hi", method = RequestMethod.GET)`相同。`@RestController`是Spring 4.0之后出现的注解，相当于`@Controller`加`@ResponseBody`结合。

![/images/blog/spring-boot/03-restful-controller/03-result-hi.png](/images/blog/spring-boot/03-restful-controller/03-result-hi.png)

![/images/blog/spring-boot/03-restful-controller/04-result-hello.png](/images/blog/spring-boot/03-restful-controller/04-result-hello.png)


参考资料
==================

Spring Boot Reference Guide : [Spring Boot Reference Guide](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

《JavaEE开发的颠覆者 Spring Boot实战》 - 汪云飞

理解RESTful架构 ：[http://www.ruanyifeng.com/blog/2011/09/restful.html](http://www.ruanyifeng.com/blog/2011/09/restful.html)
