---
layout: post
title:  Spring Boot学习笔记(二) - 第一个Spring Boot程序
date:   2017-06-20 18:14:00 +0800
categories: Spring-Boot
tag: 教程
---

* content
{:toc}


修改Maven镜像中心
==================

鉴于国内网络问题，建议在所有操作之前先修改Maven的镜像中心指向国内的。

修改`apache-maven-3.3.3\conf\settins.xml`文件中的`mirrors`,在其内部添加如下信息

{% highlight xml %}
<mirror>
  <id>alimaven</id>
  <name>aliyun maven</name>
  <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
  <mirrorOf>central</mirrorOf>
</mirror>
{% endhighlight %}


SPRING INITIALIZR
==================

+ 打开`http://start.spring.io/`，并依次选择`Maven Project`,`Java`,`1.5.4`，在`Group`的输入框中输入`com.freud.test`，在`Artifact`中输入`spring-boot-test-stater`，可以选择在`Search for dependencies`输入搜索想要选择的依赖，本次不选择。然后点击`Generate Project`, 随后会下载一个命名为`spring-boot-test-stater.zip`的文件，在当前目录解压。

![/images/blog/spring-boot/02-first-application/01-spring-starter.png](/images/blog/spring-boot/02-first-application/01-spring-starter.png)

+ 将解压的项目通过`Import Existing Maven Projects`的方式导入项目。

![/images/blog/spring-boot/02-first-application/02-maven-import.png](/images/blog/spring-boot/02-first-application/02-maven-import.png)

+ 导入后项目目录层级如下

![/images/blog/spring-boot/02-first-application/03-project-hierarchy.png](/images/blog/spring-boot/02-first-application/03-project-hierarchy.png)

+ 打开`SpringBootTestStaterApplication`Java文件，运行其Main函数，控制台打印如下，证明启动成功

{% highlight text %}
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v1.5.4.RELEASE)

2017-06-20 17:35:17.824  INFO 9388 --- [           main] c.f.t.s.SpringBootTestStaterApplication  : Starting SpringBootTestStaterApplication on Freud-PC with PID 9388 (C:\Users\Freud\Downloads\spring-boot-test-stater\target\classes started by freud in C:\Users\Freud\Downloads\spring-boot-test-stater)
2017-06-20 17:35:17.827  INFO 9388 --- [           main] c.f.t.s.SpringBootTestStaterApplication  : No active profile set, falling back to default profiles: default
2017-06-20 17:35:17.894  INFO 9388 --- [           main] s.c.a.AnnotationConfigApplicationContext : Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@fcd6521: startup date [Tue Jun 20 17:35:17 CST 2017]; root of context hierarchy
2017-06-20 17:35:18.400  INFO 9388 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2017-06-20 17:35:18.415  INFO 9388 --- [           main] c.f.t.s.SpringBootTestStaterApplication  : Started SpringBootTestStaterApplication in 0.849 seconds (JVM running for 1.137)
2017-06-20 17:35:18.417  INFO 9388 --- [       Thread-2] s.c.a.AnnotationConfigApplicationContext : Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@fcd6521: startup date [Tue Jun 20 17:35:17 CST 2017]; root of context hierarchy
2017-06-20 17:35:18.418  INFO 9388 --- [       Thread-2] o.s.j.e.a.AnnotationMBeanExporter        : Unregistering JMX-exposed beans on shutdown
{% endhighlight %}


手动创建
==================

+ 在Eclipse中新建一个Maven项目

![/images/blog/spring-boot/02-first-application/04-new-maven-project.png](/images/blog/spring-boot/02-first-application/04-new-maven-project.png)

pom.xml(Parent Pom方式)
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-01</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-01</name>
	<url>http://maven.apache.org</url>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>1.5.3.RELEASE</version>
		<relativePath />
	</parent>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
	</dependencies>
</project>
{% endhighlight %}

src/main/resources/application.properties
------------------

{% highlight text %}
server.port= 9091
{% endhighlight %}

src/main/java/com.freud.springboot.App
------------------

{% highlight java %}
package com.freud.springboot;

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

![/images/blog/spring-boot/02-first-application/05-spring-boot-project-hierarchy.png](/images/blog/spring-boot/02-first-application/05-spring-boot-project-hierarchy.png)

执行及结果
------------------

打开App类，并以Main函数的方式运行。当日志中出现如下信息表示程序已经正确启动。

{% highlight text %}
2017-06-21 09:03:26.906  INFO 5640 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 9091 (http)
{% endhighlight %}

打开浏览器并输入地址`http://localhost:9091/`,出现如下画面表示程序正常运行。

![/images/blog/spring-boot/02-first-application/06-whitelable-error-page.png](/images/blog/spring-boot/02-first-application/06-whitelable-error-page.png)

dependencyManagement方式
------------------

对于上一种Maven配置方式，是选择的使用Parent POM，但是由于在大多数项目中，都会有自己自定义的Parent POM，而Parent POM在POM定义中只能定义一次。所以Spring Boot给出了第二种配置方式--使用dependencyManagement方式，即将上文中的POM文件修改为如下。需要注意的是，在此方式下，dependencyManagement中的dependency的scope必须是import。

{% highlight java %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-01</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-01</name>
	<url>http://maven.apache.org</url>

	<!-- <parent> -->
	<!-- <groupId>org.springframework.boot</groupId> -->
	<!-- <artifactId>spring-boot-starter-parent</artifactId> -->
	<!-- <version>1.5.3.RELEASE</version> -->
	<!-- <relativePath /> -->
	<!-- </parent> -->

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


参考资料
==================

Spring Boot Reference Guide : [Spring Boot Reference Guide](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

《JavaEE开发的颠覆者 Spring Boot实战》 - 汪云飞