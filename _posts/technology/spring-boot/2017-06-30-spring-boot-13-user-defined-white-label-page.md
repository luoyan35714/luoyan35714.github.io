---
layout: post
title:  Spring Boot(十三) - 自定义WhiteLabel错误页面
date:   2017-06-30 09:30:00 +0800
categories: Spring-Boot
tag: 教程
---

* content
{:toc}


自定义`whitelabel`错误页面
==================

当使用浏览器浏览访问遇到服务器端错误的时候，Spring Boot 默认会配置一个`whitelabel`错误页面。

关闭`whitelabel`
------------------

可以通过使用`server.error.whitelabel.enabled=false`来关闭默认的错误页面，以使用servlet容器的默认页面。

覆盖`whitelabel`
------------------

覆盖`whitelabel`错误页面的方法，取决于你选用了什么页面模版。

+ ThymeLeaf：在template中新建一个error.html文件
+ FreeMarker：添加一个error.ftl模版
+ 定义一个名为`error`的Bean [ErrorMvcAutoConfiguration.java](https://github.com/spring-projects/spring-boot/blob/v1.5.4.RELEASE/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/web/ErrorMvcAutoConfiguration.java)

指定HTTP错误类型
------------------

如下可以制定当出现404显示404.html页面，如果出现`5**`的错误，则显示`5xx.html`。

{% highlight text %}
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- public/
             +- error/
             |   +- 404.html
             |   +- 5xx.html
             +- <other public assets>
{% endhighlight %}


实验
==================

> 本实验基于`Thymeleaf`进行

创建一个Maven项目
------------------

![/images/blog/spring-boot/13-white-label-page/01-new-maven-project.png](/images/blog/spring-boot/13-white-label-page/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-13</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-13</name>
	<url>http://maven.apache.org</url>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>1.5.4.RELEASE</version>
		<relativePath />
	</parent>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-thymeleaf</artifactId>
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

</project>
{% endhighlight %}

application.yml
------------------

{% highlight yml %}
spring:
  application:
    name: test-13
    
server: 
#  此处如果取消掉server.error.whitelabel.enabled的注释则默认的whitelabel就会失效
#  error:
#    whitelabel:
#      enabled: false
  port: 9090
{% endhighlight %}

error.html
------------------

{% highlight xml %}
<!DOCTYPE html>
<html>
	<head>
		<title>My Own Error Page!</title>
	</head>
	<body>
		This is the error page from freud's define
	</body>
</html>
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

![/images/blog/spring-boot/13-white-label-page/02-project-hierarchy.png](/images/blog/spring-boot/13-white-label-page/02-project-hierarchy.png)

运行结果
------------------

![/images/blog/spring-boot/13-white-label-page/03-explorer-run-result.png](/images/blog/spring-boot/13-white-label-page/03-explorer-run-result.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

《JavaEE开发的颠覆者 Spring Boot实战》 - 汪云飞