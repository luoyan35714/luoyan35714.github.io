---
layout: post
title:  Spring Boot(十) - 构建web服务 - XML REST
date:   2017-06-27 18:00:00 +0800
categories: 技术文档
tag: Spring-Boot
---

* content
{:toc}


XML REST服务
==================

如果classpath下存在Jackson XML扩展（ jackson-dataformat-xml.jar ），它会被用来渲染XML响应，示例和JSON的非常相似。想要使用它，只需为你的项目添加以下依赖：

{% highlight xml %}
<dependency>
	<groupId>com.fasterxml.jackson.dataformat</groupId>
	<artifactId>jackson-dataformat-xml</artifactId>
</dependency>
{% endhighlight %}

你可能还需要添加Woodstox的依赖，它比JDK提供的默认StAX实现快很多，并且支持良好的格式化输出，提高了namespace处理能力：(实践中发现`org.springframework.boot.spring-boot-dependencies`并没有定义此依赖，所以使用的时候需要制定版本号)

{% highlight xml %}
<dependency>
	<groupId>org.codehaus.woodstox</groupId>
	<artifactId>woodstox-core-asl</artifactId>
</dependency>
{% endhighlight %}

如果Jackson的XML扩展不可用，Spring Boot将使用JAXB（JDK默认提供），不过 MyThing 需要注解 `@XmlRootElement` 或 `@JacksonXmlRootElement` ：

{% highlight java %}
@XmlRootElement
public class MyThing {
	private String name;
	// .. getters and setters
}
{% endhighlight %}


实验
==================

创建一个Maven项目
------------------

![/images/blog/spring-boot/10-web-service-xml-rest/01-new-maven-project.png](/images/blog/spring-boot/10-web-service-xml-rest/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-10</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-10</name>
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
			<groupId>com.fasterxml.jackson.dataformat</groupId>
			<artifactId>jackson-dataformat-xml</artifactId>
		</dependency>
		<dependency>
			<groupId>org.codehaus.woodstox</groupId>
			<artifactId>woodstox-core-asl</artifactId>
			<version>4.4.1</version>
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
    name: test-10
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

import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Freud
 */
@XmlRootElement
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

![/images/blog/spring-boot/10-web-service-xml-rest/02-project-hierarchy.png](/images/blog/spring-boot/10-web-service-xml-rest/02-project-hierarchy.png)

运行结果
------------------

![/images/blog/spring-boot/10-web-service-xml-rest/03-explorer-result.png](/images/blog/spring-boot/10-web-service-xml-rest/03-explorer-result.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)
