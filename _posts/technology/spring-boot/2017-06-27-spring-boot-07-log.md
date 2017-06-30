---
layout: post
title:  Spring Boot学习笔记(七) - 日志
date:   2017-06-27 10:57:00 +0800
categories: Spring Boot
tag: 教程
---

* content
{:toc}


日志格式
==================

Spring Boot默认的日志输出格式如下：

{% highlight text %}
2017-06-27 11:39:35.475  INFO 2132 --- [           main] com.freud.test.springboot.App            : Starting App on Freud-20170622FKL with PID 2132 (D:\workspaces\wolfly\spring-boot-07\target\classes started by Freud in D:\workspaces\wolfly\spring-boot-07)
2017-06-27 11:39:35.478  INFO 2132 --- [           main] com.freud.test.springboot.App            : No active profile set, falling back to default profiles: default
2017-06-27 11:39:35.529  INFO 2132 --- [           main] ationConfigEmbeddedWebApplicationContext : Refreshing org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@6b4a4e18: startup date [Tue Jun 27 11:39:35 CST 2017]; root of context hierarchy
2017-06-27 11:39:36.851  INFO 2132 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat initialized with port(s): 9090 (http)
2017-06-27 11:39:36.866  INFO 2132 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2017-06-27 11:39:36.867  INFO 2132 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet Engine: Apache Tomcat/8.5.15
2017-06-27 11:39:36.971  INFO 2132 --- [ost-startStop-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2017-06-27 11:39:36.971  INFO 2132 --- [ost-startStop-1] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 1445 ms
2017-06-27 11:39:37.121  INFO 2132 --- [ost-startStop-1] o.s.b.w.servlet.ServletRegistrationBean  : Mapping servlet: 'dispatcherServlet' to [/]
2017-06-27 11:39:37.125  INFO 2132 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'characterEncodingFilter' to: [/*]
2017-06-27 11:39:37.126  INFO 2132 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'hiddenHttpMethodFilter' to: [/*]
2017-06-27 11:39:37.126  INFO 2132 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'httpPutFormContentFilter' to: [/*]
2017-06-27 11:39:37.126  INFO 2132 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'requestContextFilter' to: [/*]
2017-06-27 11:39:37.432  INFO 2132 --- [           main] s.w.s.m.m.a.RequestMappingHandlerAdapter : Looking for @ControllerAdvice: org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@6b4a4e18: startup date [Tue Jun 27 11:39:35 CST 2017]; root of context hierarchy
2017-06-27 11:39:37.489  INFO 2132 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error]}" onto public org.springframework.http.ResponseEntity<java.util.Map<java.lang.String, java.lang.Object>> org.springframework.boot.autoconfigure.web.BasicErrorController.error(javax.servlet.http.HttpServletRequest)
2017-06-27 11:39:37.490  INFO 2132 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error],produces=[text/html]}" onto public org.springframework.web.servlet.ModelAndView org.springframework.boot.autoconfigure.web.BasicErrorController.errorHtml(javax.servlet.http.HttpServletRequest,javax.servlet.http.HttpServletResponse)
2017-06-27 11:39:37.510  INFO 2132 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/webjars/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2017-06-27 11:39:37.510  INFO 2132 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2017-06-27 11:39:37.542  INFO 2132 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**/favicon.ico] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2017-06-27 11:39:37.657  INFO 2132 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2017-06-27 11:39:37.729  INFO 2132 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 9090 (http)
2017-06-27 11:39:37.733  INFO 2132 --- [           main] com.freud.test.springboot.App            : Started App in 2.539 seconds (JVM running for 2.82)
{% endhighlight %}

输出的节点（items）如下：

1. 日期和时间 - 精确到毫秒，且易于排序。
2. 日志级别 - ERROR , WARN , INFO , DEBUG 或 TRACE 。
3. Process ID。
4. --- 分隔符，用于区分实际日志信息开头。
5. 线程名 - 包括在方括号中（控制台输出可能会被截断）。
6. 日志名 - 通常是源class的类名（缩写）。
7. 日志信息。

> 注 Logback没有 `FATAL` 级别，它会映射到 `ERROR` 。


控制台输出
==================

默认的日志配置会在写日志消息时将它们回显到控制台，级别为 `INFO` , 所以`ERROR`, `WARN`和`INFO`的消息会被记录。

DEBUG级别
------------------

有两种方式可以启用DEBUG级别的日志输出，分别是

+ application.yml

{% highlight yml %}
debug: true
{% endhighlight %}

+ 启动参数

{% highlight bash %}
$ java -jar myapp.jar --debug
{% endhighlight %}

Color-coded输出
------------------

如果终端支持`ANSI`，Spring Boot将使用彩色编码（color output）输出日志以增强可读性，可以将 `spring.output.ansi.enabled` 设置为一个支持的值来覆盖默认设置, 其可配置的值有三个，`always`, `detect`, `never`。输出的默认色彩编码如下：

| Level 	| Color 	|
| FATAL 	| Red		|
| ERROR 	| Red		|
| WARN 		| Yellow	|
| INFO 		| Green		|
| DEBUG 	| Green		|
| TRACE 	| Green		|

示例：

![/images/blog/spring-boot/07-log/01-console-color-output.png](/images/blog/spring-boot/07-log/01-console-color-output.png)

还可以通过Spring Tool Suit的启动配置来设置ASCI输出。

![/images/blog/spring-boot/07-log/02-enable-console-color-output.png](/images/blog/spring-boot/07-log/02-enable-console-color-output.png)


文件输出
==================

默认情况下，Spring Boot只会将日志记录到控制台，而不写进日志文件，如果需要，可以设置 logging.file 或 logging.path 属性（例如 application.properties ）。

| logging.file 		| logging.path 			| 示例 		| 描述 																	|
| (none) 			| (none) 				| 			| 只记录到控制台 														|
| Specific file 	| (none) 				| my.log 	| 写到特定的日志文件，名称可以是精确的位置或相对于当前目录 				|
| (none) 			| Specific directory 	| /var/log 	| 写到特定目录下的 spring.log 里，名称可以是精确的位置或相对于当前目录 	|

> 日志文件每达到10M就会被分割，跟控制台一样，默认记录 ERROR ,WARN 和 INFO 级别的信息。


日志级别
==================

有Spring Boot支持的日志系统支持以下级别日志输出TRACE , DEBUG , INFO , WARN , ERROR , FATAL , OFF

以下是 application.properties 示例：

{% highlight text %}
logging.level.root=WARN
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate=ERROR
{% endhighlight %}


自定义日志配置
==================

通过将相应的库添加到classpath可以激活各种日志系统，然后在classpath根目录下提供合适的配置文件可以进一步定制日志系统，配置文件也可以通过Spring Environment 的 `logging.config` 属性指定。

使用 `org.springframework.boot.logging.LoggingSystem` 系统属性可以强制Spring Boot使用指定的日志系统，该属性值需要是 LoggingSystem 实现类的全限定名，如果值为 `none` ，则彻底禁用Spring Boot的日志配置。

> 由于日志初始化早于 `ApplicationContext` 的创建，所以不可能通过 `@PropertySources` 指定的Spring `@Configuration` 文件控制日志，系统属性和Spring Boot外部化配置可以正常工作。

以下文件会根据你选择的日志系统进行加载：

| 日志系统 					| 定制配置 																		|
| Logback 					| logback-spring.xml , logbackspring.groovy , logback.xml 或 logback.groovy 	|
| Log4j 					| log4j.properties 或 log4j.xml 												|
| Log4j2 					| log4j2-spring.xml 或 log4j2.xml 												|
| JDK (Java Util Logging) 	| logging.properties 															|


logback扩展
==================

Spring Boot包含很多有用的Logback扩展，可以在 `logback-spring.xml` 配置文件中使用它们。

> 注: 不能在标准的 `logback.xml` 配置文件中使用扩展，因为它加载的太早了，不过可以使用 `logback-spring.xml` ，或指定 logging.config 属性。


实验
==================

创建一个Maven项目
------------------

![/images/blog/spring-boot/07-log/03-new-maven-project.png](/images/blog/spring-boot/07-log/03-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-07</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-07</name>
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

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @author Freud
 */
@SpringBootApplication
public class App {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(App.class);
		app.setBannerMode(Banner.Mode.OFF);
		app.run(args);
	}

}
{% endhighlight %}

application.yml
------------------

{% highlight yml %}
spring:
  application:
    name: test-07
  output:
    ansi:
      enabled: never
server: 
  port: 9090
  
debug: true

logging:
  level:
    root: WARN
    org:
      springframework:
        web: DEBUG
      hibernate: ERROR
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/07-log/04-project-hierarchy.png](/images/blog/spring-boot/07-log/04-project-hierarchy.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)
