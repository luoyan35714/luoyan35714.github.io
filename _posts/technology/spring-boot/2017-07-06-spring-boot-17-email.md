---
layout: post
title:  Spring Boot学习笔记(十七) - 邮件发送
date:   2017-07-06 14:45:00 +0800
categories: Spring-Boot
tag: 教程
---

* content
{:toc}


邮件发送
==================

Spring框架通过 `JavaMailSender` 接口为发送邮件提供了一个简单的抽象，并且Spring Boot也为它提供了自动配置和一个starter模块。 具体查看[JavaMailSender参考文档](http://docs.spring.io/spring/docs/4.3.3.RELEASE/spring-framework-reference/htmlsingle/#mail)。

如果 `spring.mail.host` 和相关的`libraries`（通过 `spring-boot-starter-mail` 定义的）都可用，Spring Boot将创建一个默认的 `JavaMailSender` ，该sender可以通过 `spring.mail` 命名空间下的配置项进一步自定义，具体参考[MailProperties](https://github.com/spring-projects/spring-boot/blob/master/spring-boot-autoconfigure/src/main/java/org/springframework/boot/autoconfigure/mail/MailProperties.java)。


实验
==================

创建一个Maven项目
------------------

![/images/blog/spring-boot/17-email/01-new-maven-project.png](/images/blog/spring-boot/17-email/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-17</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-17</name>
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
			<artifactId>spring-boot-starter-mail</artifactId>
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
    name: test-17
  mail:
    protocol: smtp
    host: smtp.126.com
    port: 25
    username: ## 用户名
    password: ## 密码
    default-encoding: UTF-8
server:
  port: 9090
{% endhighlight %}

App.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import java.util.Date;

import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMessage.RecipientType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Freud
 */
@SpringBootApplication
@RestController
public class App {

	@Autowired
	private JavaMailSender javaMailSender;

	private static final String MAIL_ADDRESS = "luoyan35714@126.com";

	@GetMapping("/send")
	public String sendMail() {
		try {
			MimeMessage mail = javaMailSender.createMimeMessage();

			mail.addRecipients(RecipientType.TO, MAIL_ADDRESS);
			mail.setFrom(MAIL_ADDRESS);
			mail.setSentDate(new Date());
			mail.setSubject("Test Spring Boot Send Mail - Subject");
			mail.setText("Test Spring Boot Send Mail - Content");

			javaMailSender.send(mail);

			return "success";
		} catch (Exception e) {
			e.printStackTrace();
			return "failed";
		}

	}

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/17-email/02-project-hierarchy.png](/images/blog/spring-boot/17-email/02-project-hierarchy.png)


运行结果
==================

访问如下URL - `http://localhost:9090/send`, 当页面返回`success`表示发送成功，则打开邮箱查看邮件，当页面返回`failed`表示发送失败，可以查看控制台报错，分析错误原因。

![/images/blog/spring-boot/17-email/03-explorer-run-result.png](/images/blog/spring-boot/17-email/03-explorer-run-result.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)
