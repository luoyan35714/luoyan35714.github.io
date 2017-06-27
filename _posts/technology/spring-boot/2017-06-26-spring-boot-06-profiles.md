---
layout: post
title:  Spring Boot学习笔记(六) - Profiles
date:   2017-06-26 17:00:00 +0800
categories: Spring Boot
tag: 教程
---

* content
{:toc}


Profile
==================

定义
------------------

Spring Profiles提供了一种隔离应用程序配置的方式，并让这些配置只在特定的环境下生效。

Configuration
------------------

Spring 定义了很多种配置方式。其中比较常用的有两种，第一种是注解方式，第二种是application.yml方式。

![/images/blog/spring-boot/06-profiles/01-profile-annotation.png](/images/blog/spring-boot/06-profiles/01-profile-annotation.png)
![/images/blog/spring-boot/06-profiles/02-profile-application-yml.png](/images/blog/spring-boot/06-profiles/02-profile-application-yml.png)


实验
==================

创建一个Maven项目
------------------

![/images/blog/spring-boot/06-profiles/03-new-maven-project.png](/images/blog/spring-boot/06-profiles/03-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-06</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-06</name>
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

App.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Freud
 */
@SpringBootApplication
@RestController
public class App {

	@Autowired
	private Dog dog;

	@Autowired
	private Cat cat;

	@RequestMapping("/dog")
	public Dog getDog() {
		Dog ret = new Dog();
		BeanUtils.copyProperties(dog, ret);
		return ret;
	}

	@RequestMapping("/cat")
	public Cat getCat() {
		return cat;
	}

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

}
{% endhighlight %}

Cat.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author Freud
 */
@Component
@ConfigurationProperties(prefix = "cat")
public class Cat {

	private String name;
	private int age;

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

Dog.java
------------------

{% highlight java %}
package com.freud.test.springboot;

/**
 * @author Freud
 */
public class Dog {

	private String name;
	private String age;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getAge() {
		return age;
	}

	public void setAge(String age) {
		this.age = age;
	}
}
{% endhighlight %}

DogDev.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * @author Freud
 */
@Configuration
@Profile("dev")
public class DogDev extends Dog {

	public DogDev() {
		super.setName("Jack");
		super.setAge("10");
	}
}
{% endhighlight %}

DogPrd.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * @author Freud
 */
@Configuration
@Profile("prd")
public class DogPrd extends Dog {

	public DogPrd() {
		this.setName("Rose");
		this.setAge("5");
	}

}
{% endhighlight %}

application.yml
------------------

{% highlight yml %}
spring:
  profiles:
    active: prd
{% endhighlight %}

application-dev.yml
------------------

{% highlight yml %}
spring:
  application:
    name: test-06
server:
  port: 9091
  
cat: 
  name: Tom
  age: 2
{% endhighlight %}

application-prd.yml
------------------

{% highlight yml %}
spring:
  application:
    name: test-06
server:
  port: 9090
  
cat: 
  name: Lucy
  age: 5
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/06-profiles/04-project-hierarchy.png](/images/blog/spring-boot/06-profiles/04-project-hierarchy.png)


启动方式
==================

App类main函数直接运行
------------------

通过App类的main函数直接运行，会加载classpath路径下的`application.yml`，而其中配置的active profile是prd，所以application-prd.yml会生效。

App类main函数修改启动参数运行
------------------

![/images/blog/spring-boot/06-profiles/05-run-as-main-with-arguments.png](/images/blog/spring-boot/06-profiles/05-run-as-main-with-arguments.png)

jar方式运行
------------------

{% highlight bash %}
mvn clean install
java -jar target/spring-boot-06-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
{% endhighlight %}


查看结果
==================

http://localhost:9091/cat
------------------

![/images/blog/spring-boot/06-profiles/06-dev-cat.png](/images/blog/spring-boot/06-profiles/06-dev-cat.png)

http://localhost:9091/dog
------------------

![/images/blog/spring-boot/06-profiles/07-dev-dog.png](/images/blog/spring-boot/06-profiles/07-dev-dog.png)


参考资料
==================

Spring Boot Reference Guide : [Spring Boot Reference Guide](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

spring @profile注解的使用 : [spring @profile注解的使用](http://blog.csdn.net/wild46cat/article/details/71189858)
