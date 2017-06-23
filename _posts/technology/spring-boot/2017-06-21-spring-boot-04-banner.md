---
layout: post
title:  Spring Boot学习笔记(四) - Banner
date:   2017-06-21 10:42:00 +0800
categories: Spring Boot
tag: 教程
---

* content
{:toc}


Banner
==================

`banner`中文释义是横幅，标语的意思，在SpringBoot中是指程序启动时在控制台输出的由字符组成的大字标语。默认是`Spring`

创建一个Spring Boot项目
==================

创建一个Maven项目
------------------

![/images/blog/spring-boot/04-banner/01-new-maven-project.png](/images/blog/spring-boot/04-banner/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-03</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-03</name>
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
spring.application.name=test-03
server.port= 9091
{% endhighlight %}

src/main/java/com.freud.springboot.App
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

![/images/blog/spring-boot/04-banner/02-project-hierarchy.png](/images/blog/spring-boot/04-banner/02-project-hierarchy.png)


运行及结果
==================

通过main函数的方式运行App类。控制台输出如下

![/images/blog/spring-boot/04-banner/03-console-output.png](/images/blog/spring-boot/04-banner/03-console-output.png)


定制Banner
==================

打开[http://patorjk.com/software/taag/](http://patorjk.com/software/taag/)并选择合适的字体和内容生成字符标语。

![/images/blog/spring-boot/04-banner/04-new-banner.png](/images/blog/spring-boot/04-banner/04-new-banner.png)


设置Banner
==================

src/main/resources/banner.txt
------------------

在src/main/resources下新建文件`banner.txt`文件，并把刚刚生成的Banner复制到此文件中。

banner.txt文件
------------------

![/images/blog/spring-boot/04-banner/05-banner-file.png](/images/blog/spring-boot/04-banner/05-banner-file.png)

项目结构
------------------

![/images/blog/spring-boot/04-banner/06-project-hierarchy.png](/images/blog/spring-boot/04-banner/06-project-hierarchy.png)


重新运行
==================

通过main函数的方式重新运行App类。控制台输出如下

![/images/blog/spring-boot/04-banner/07-console-output.png](/images/blog/spring-boot/04-banner/07-console-output.png)


其他方式
==================

以上的例子中使用的是默认位置的banner.txt文件，当然我们也可以指定banner文件的位置，通过以下几种方式修改Banner。并且banner的文件类型可以是txt，或者banner.gif,
banner.jpg or banner.png等图片文件。

application.properties
------------------

{% highlight text %}
banner.location=classpath:/path/banner.txt
{% endhighlight %}

代码设置--普通API
------------------

{% highlight java %}
SpringApplication app = new SpringApplication(App.class);
Banner banner = new ResourceBanner(new FileSystemResource(new File("src/main/resources/path/banner.txt")));
app.setBanner(banner);
app.run(args);
{% endhighlight %}

代码设置--Fluent Builder API
------------------

{% highlight java %}
new SpringApplicationBuilder()
	.sources(App.class)
	.banner(new ResourceBanner(new FileSystemResource(new File("src/main/resources/path/banner.txt"))))
	.run(args);
{% endhighlight %}


关闭banner显示
==================

当然，有时候我们不想要banner显示，我们可以通过配置，将banner的显示关掉。

application.properties
------------------

{% highlight text %}
spring.main.banner-mode=off
{% endhighlight %}

代码设置--普通API
------------------

{% highlight java %}
SpringApplication app = new SpringApplication(App.class);
		app.setBannerMode(Banner.Mode.OFF);
		app.run(args);
{% endhighlight %}

代码设置--Fluent Builder API
------------------

{% highlight java %}
new SpringApplicationBuilder()
	.sources(App.class)
	.bannerMode(Banner.Mode.OFF)
	.run(args);
{% endhighlight %}


参考资料
==================

Spring Boot Reference Guide : [Spring Boot Reference Guide](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

《JavaEE开发的颠覆者 Spring Boot实战》 - 汪云飞
