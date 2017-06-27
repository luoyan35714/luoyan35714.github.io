---
layout: post
title:  Spring Boot学习笔记(八) - 元注解与组合注解
date:   2017-06-27 14:04:00 +0800
categories: Spring Boot
tag: 教程
---

* content
{:toc}


> 所谓的元注解：其实就是可以注解到别的注解上的注解。而被注解的注解我们就称之为组合注解。这样，组合注解同时具备元注解的功能！

元注解
==================

Spring4.0的许多注解都可以用作meta annotation（元注解）。元注解是一种使用在别的注解上的注解。这意味着我们可以使用Spring的注解组合成一个我们自己的注解。

类似于：`@Documented`, `@Component`, `@RequestMapping`, `@Controller`, `@ResponseBody`等等

对于元注解，是Spring框架中定义的部分，都有特定的含义。我们并不能修改，但是对于组合注解，我们完全可以基于自己的定义进行实现。


组合注解
==================

自定义注解或组合注解是从其他的Spring元注解创建的。这种注解分为两类：

+ 只是为了编码简单将多个注解组合成一个注解；
+ 可以定义一个可复用的注解，这个注解可以解决问题，但是不用记住所有单独的注解。

创建一个组合注解
------------------

创建一个组合注解，并且提供注解value属性。

{% highlight java %}
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Controller
@ResponseBody
public @interface RestControllerShadow {
	String value() default "";
}
{% endhighlight %}

传递属性给元注解元注解
------------------

而当我们使用的元注解需要配置属性的时候，可以通过如下指定：

{% highlight java %}
@AliasFor(annotation = RequestMapping.class)
String name() default "";
{% endhighlight %}


实验
==================

创建一个Maven项目
------------------

![/images/blog/spring-boot/08-composite-annotation/01-new-maven-project.png](/images/blog/spring-boot/08-composite-annotation/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-08</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-08</name>
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
    name: test-08
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
@RestControllerShadow
public class App {

	@GetMappingShadow("/hi")
	public String get() {
		return "Composite Annotation";
	}

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

}
{% endhighlight %}

GetMappingShadow.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.core.annotation.AliasFor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * A copy of @GetMapping
 * 
 * @author Freud
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@RequestMapping(method = RequestMethod.GET)
public @interface GetMappingShadow {

	@AliasFor(annotation = RequestMapping.class)
	String name() default "";

	@AliasFor(annotation = RequestMapping.class)
	String[] value() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] path() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] params() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] headers() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] consumes() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] produces() default {};
}
{% endhighlight %}

RestControllerShadow.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * A copy of @RestController
 * 
 * @author Freud
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Controller
@ResponseBody
public @interface RestControllerShadow {

	String value() default "";

}
{% endhighlight %}

运行结果
------------------

![/images/blog/spring-boot/08-composite-annotation/02-explorer-show.png](/images/blog/spring-boot/08-composite-annotation/02-explorer-show.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

Spring4.0系列4-Meta Annotation（元注解）: [Spring4.0系列4-Meta Annotation（元注解）](http://wiselyman.iteye.com/blog/2002518)