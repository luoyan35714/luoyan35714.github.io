---
layout: post
title:  Spring Boot学习笔记(九) - 构建web服务 - JSON REST
date:   2017-06-27 17:30:00 +0800
categories: Spring-Boot
tag: 教程
---

* content
{:toc}


Web服务
==================

通过Spring Boot可以对外提供的Web服务可以划分为四种：

+ JSON REST服务
+ XML REST服务
+ WebService服务
+ WEB网页服务


JSON REST服务
==================

只要添加有Jackson2依赖，

![/images/blog/spring-boot/09-web-service-json-rest/01-jackson2-dependency.png](/images/blog/spring-boot/09-web-service-json-rest/01-jackson2-dependency.png)

Spring Boot应用中的任何 `@RestController` 默认都会渲染为JSON响应，例如：

{% highlight java %}
@RestController
public class MyController {
	@RequestMapping("/thing")
	public MyThing thing() {
		return new MyThing();
	}
}
{% endhighlight %}

只要 MyThing 能够通过Jackson2序列化（比如，一个标准的POJO或Groovy对象），默认localhost:8080/thing将响应一个JSON数据


实验
==================

创建一个Maven项目
------------------

![/images/blog/spring-boot/09-web-service-json-rest/02-new-maven-project.png](/images/blog/spring-boot/09-web-service-json-rest/02-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-09</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-09</name>
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

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<executions>
					<execution>
						<goals>
							<goal>repackage</goal>
						</goals>
					</execution>
				</executions>
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
    name: test-09
server:
  port: 9090
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

MyController.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import java.util.Date;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Freud
 */
@RestController
public class MyController {

	@RequestMapping("/thing")
	public MyThing thing() {
		MyThing thing = new MyThing();
		thing.setWhen(new Date());
		thing.setThingTodo("Go out for walking.");
		return thing;
	}

}
{% endhighlight %}

MyThing.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import java.util.Date;

/**
 * @author Freud
 */
public class MyThing {

	private Date when;
	private String thingTodo;

	public Date getWhen() {
		return when;
	}

	public void setWhen(Date when) {
		this.when = when;
	}

	public String getThingTodo() {
		return thingTodo;
	}

	public void setThingTodo(String thingTodo) {
		this.thingTodo = thingTodo;
	}

}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/09-web-service-json-rest/03-project-hierarchy.png](/images/blog/spring-boot/09-web-service-json-rest/03-project-hierarchy.png)

运行结果
------------------

![/images/blog/spring-boot/09-web-service-json-rest/04-explorer-result.png](/images/blog/spring-boot/09-web-service-json-rest/04-explorer-result.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)
