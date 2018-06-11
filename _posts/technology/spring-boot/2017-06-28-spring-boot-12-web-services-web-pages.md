---
layout: post
title:  Spring Boot学习笔记(十二) - 构建web服务 - Web网页服务
date:   2017-06-28 15:40:00 +0800
categories: Spring-Boot
tag: 教程
---

* content
{:toc}


Web网页服务
==================

Spring Boot非常适合开发web应用程序(实际底层是依靠`Spring Web MVC`支撑)。可以使用内嵌的Tomcat，Jetty或Undertow轻轻松松地创建一个HTTP服务器。大多数的web应用都可以使用 `spring-boot-starter-web` 模块进行快速搭建和运行。

Spring Web MVC框架（通常简称为"Spring MVC"）是一个富`模型`，`视图`，`控制器`web框架， 允许用户创建特定的 `@Controller` 或 `@RestController`(4.0以后)beans来处理传入的HTTP请求，通过 `@RequestMapping` 注解可以将控制器中的方法映射到相应的HTTP请求，根据特定的规则进行相应的Response渲染。或JSON,XML,或页面渲染渲染。

所以根据上面得出的结论就是，Spring Boot开发WEB网页服务是跟Spring MVC一样的。具体的Spring MVC教程可以参见[易百教程](http://www.yiibai.com/spring_mvc/spring-mvc-tutorial-for-beginners.html), 官网没有找到关于Spring MVC的教程，所以看这个把.

静态资源
------------------

默认情况下，Spring Boot从classpath下的 `/static` , `/public` ， `/resources` 或 `/META-INF/resources`或 从 `ServletContext` 根目录提供静态内容。这是通过Spring MVC的 `ResourceHttpRequestHandler` 实现的，

其中优先级如下`META/resources` > `resources` > `static` > `public`

可以设置 spring.resources.staticLocations 属性自定义静态资源的位置（配置一系列目录位置代替默认的值），

模板引擎
------------------

+ [FreeMarker](http://freemarker.org/docs/)
+ [Groovy](http://docs.groovy-lang.org/docs/next/html/documentation/template-engines.html#_the_markuptemplateengine)
+ [Thymeleaf](http://www.thymeleaf.org/)(官方推荐)
+ <del>Velocity</del>（1.4已不再支持）
+ [Mustache](https://mustache.github.io/)
+ <del>JSP</del>（不推荐，由于在内嵌servlet容器中使用JSPs存在一些[已知的限制](http://docs.spring.io/spring-boot/docs/1.5.4.RELEASE/reference/htmlsingle/#boot-features-jsp-limitations)）

> 使用以上引擎中的任何一种，并采用默认配置，则模块会从 src/main/resources/templates 自动加载。


实验
==================

> 本实验基于`Thymeleaf`进行，并且修改自[spring-boot-sample-web-thymeleaf3](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-samples/spring-boot-sample-web-thymeleaf3)

创建一个Maven项目
------------------

![/images/blog/spring-boot/12-web-service-web-pages/01-new-maven-project.png](/images/blog/spring-boot/12-web-service-web-pages/01-new-maven-project.png)

pom.xml
------------------

> 在实验过程中发现使用`dependencyManagement`模式还是会有部分问题。而相同的代码使用`parent`依赖方式就没有问题，原因未知，所以且会了使用parent依赖方式。

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-12</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>1.5.4.RELEASE</version>
		<relativePath />
	</parent>

	<name>spring-boot-12</name>
	<url>http://maven.apache.org</url>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<thymeleaf.version>3.0.2.RELEASE</thymeleaf.version>
		<thymeleaf-layout-dialect.version>2.1.1</thymeleaf-layout-dialect.version>
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

<!-- 	<dependencyManagement> -->
<!-- 		<dependencies> -->
<!-- 			<dependency> -->
<!-- 				<groupId>org.springframework.boot</groupId> -->
<!-- 				<artifactId>spring-boot-dependencies</artifactId> -->
<!-- 				<version>1.5.4.RELEASE</version> -->
<!-- 				<type>pom</type> -->
<!-- 				<scope>import</scope> -->
<!-- 			</dependency> -->
<!-- 		</dependencies> -->
<!-- 	</dependencyManagement> -->

</project>
{% endhighlight %}

application.yml
------------------

{% highlight yml %}
spring:
  application:
    name: test-12
  thymeleaf:
    mode: html
    cache: false
  mvc:
    # 重新定义静态资源路径访问规则，类似于Spring MVC的<mvc:resources />标签
    static-path-pattern: /test/**
  resources:
    # 路径是数组类型，按照配置决定优先级，默认的路径配置依旧存在，不会因为配置新的而覆盖掉/static,/public等等
    static-locations: 
    - classpath:/hello/
    - classpath:/freud/
server:
  port: 9090
{% endhighlight %}

freud/hifreud.html
------------------

{% highlight html %}
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Hi Freud</title>
	</head>
	<body>
		Hi Freud!
	</body>
</html>
{% endhighlight %}

hello/hi.html
------------------

{% highlight html %}
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Hi Page</title>
	</head>
	<body>
		Hi Page!
	</body>
</html>
{% endhighlight %}

templates/layout.html
------------------

{% highlight html %}
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
	xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
	<head>
		<title>Layout</title>
	</head>
	<body>
		<div style="text-align: center;width: 600px;">
			<h1 layout:fragment="header">Layout</h1>
			<div layout:fragment="content">Fake content</div>
		</div>
	</body>
</html>
{% endhighlight %}

templates/messages/form.html
------------------

{% highlight html %}
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
	xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
	layout:decorate="layout">
<head>
<title>Messages : Create</title>
</head>
<body>
	<h1 layout:fragment="header">Messages : Create</h1>
	<div layout:fragment="content" class="container">
		<form id="messageForm" th:action="@{/(form)}" th:object="${message}" action="#" method="post">
			<div th:if="${#fields.hasErrors('*')}">
				<p th:each="error : ${#fields.errors('*')}" th:text="${error}"> Validation error</p>
			</div>
			<div>
				<a th:href="@{/}" href="messages.html"> Messages </a>
			</div>
			<br />
			<input type="hidden" th:field="*{id}" th:class="${#fields.hasErrors('id')} ? 'field-error'" /> 
			<table style="width: 600px;">
				<tr>
					<td>
						<label for="summary">Summary</label>
					</td>
					<td> 
						<input type="text" th:field="*{summary}" th:class="${#fields.hasErrors('summary')} ? 'field-error'" style="width:400px" />
					</td>
				</tr> 
				<tr>
					<td>
						<label for="text">Message</label>
					</td>
					<td>
						<textarea th:field="*{text}" th:class="${#fields.hasErrors('text')} ? 'field-error'" style="width:400px"></textarea>
					</td>
				</tr>
			</table>
			<div class="form-actions">
				<input type="submit" value="Save" />
			</div>
		</form>
	</div>
</body>
</html>
{% endhighlight %}

templates/messages/list.html
------------------

{% highlight html %}
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
	xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
	layout:decorate="layout">
<head>
<title>Messages : View all</title>
</head>
<body>
	<h1 layout:fragment="header">Messages : View all</h1>
	<hr />
	<div>
		<a href="form.html" th:href="@{/(form)}">Create Message</a>
	</div>
	<hr />
	<div layout:fragment="content">
		<div>
			<a href="form.html" th:href="@{/(form)}">Create Message</a>
		</div>
		<table border="1" style="width: 600px;">
			<thead>
				<tr>
					<td>ID</td>
					<td>Created</td>
					<td>Summary</td>
				</tr>
			</thead>
			<tbody>
				<tr th:if="${messages.empty}">
					<td colspan="3">No messages</td>
				</tr>
				<tr th:each="message : ${messages}">
					<td th:text="${message.id}">1</td>
					<td th:text="${#calendars.format(message.created)}"></td>
					<td><a href="view.html" th:href="@{'/' + ${message.id}}"
						th:text="${message.summary}"> The summary </a></td>
				</tr>
			</tbody>
		</table>
	</div>
</body>
</html>
{% endhighlight %}

templates/messages/view.html
------------------

{% highlight html %}
<html xmlns:th="http://www.thymeleaf.org"
	xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
	layout:decorate="layout">
<head>
<title>Messages : View</title>
</head>
<body>
	<h1 layout:fragment="header">Messages : Create</h1>
	<div layout:fragment="content">
		<div th:if="${globalMessage}" th:text="${globalMessage}">Some Success message</div>
		<div>
			<a th:href="@{/}" href="list.html"> Messages </a>
		</div>
		<table border="1" style="width: 600px;">
			<tr>
				<td>ID</td>
				<td id="id" th:text="${message.id}"></td>
			</tr>
			<tr>
				<td>Date</td>
				<td id="created" th:text="${#calendars.format(message.created)}" />
			</tr>
			<tr>
				<td>Summary</td>
				<td id="summary" th:text="${message.summary}" />
			</tr>
			<tr>
				<td>Message</td>
				<td id="text" th:text="${message.text}" />
			</tr>
			<tr>
				<td>Operate</td>
				<td><a href="messages" th:href="@{'/delete/' + ${message.id}}">delete </a>
			 	 | <a href="form.html" th:href="@{'/modify/' + ${message.id}}"> modify </a></td>
			</tr>
		</table>
	</div>
</body>
</html>
{% endhighlight %}

App.java
------------------

{% highlight java %}
package com.freud.test.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.freud.test.springboot.repository.InMemoryMessageRepository;
import com.freud.test.springboot.repository.MessageRepository;

/**
 * @author Freud
 */
@SpringBootApplication
public class App {

	@Bean
	public MessageRepository messageRepository() {
		return new InMemoryMessageRepository();
	}

	public static void main(String[] args) throws Exception {
		SpringApplication.run(App.class, args);
	}

}
{% endhighlight %}

Message.java
------------------

{% highlight java %}
package com.freud.test.springboot.bean;

import java.util.Calendar;

import org.hibernate.validator.constraints.NotEmpty;

/**
 * @author Freud
 */
public class Message {

	private Long id;

	@NotEmpty(message = "Message is required.")
	private String text;

	@NotEmpty(message = "Summary is required.")
	private String summary;

	private Calendar created = Calendar.getInstance();

	public Long getId() {
		return this.id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Calendar getCreated() {
		return this.created;
	}

	public void setCreated(Calendar created) {
		this.created = created;
	}

	public String getText() {
		return this.text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public String getSummary() {
		return this.summary;
	}

	public void setSummary(String summary) {
		this.summary = summary;
	}
}
{% endhighlight %}

MessageController.java
------------------

{% highlight java %}
package com.freud.test.springboot.controller;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.freud.test.springboot.bean.Message;
import com.freud.test.springboot.repository.MessageRepository;

/**
 * @author Freud
 */
@Controller
@RequestMapping("/")
public class MessageController {

	@Autowired
	private MessageRepository messageRepository;

	@GetMapping
	public ModelAndView list() {
		ModelAndView mav = new ModelAndView();
		mav.setViewName("messages/list");
		mav.addObject("messages", this.messageRepository.findAll());
		return mav;
	}

	@GetMapping("{id}")
	public ModelAndView view(@PathVariable("id") Long id) {
		ModelAndView mav = new ModelAndView();
		mav.setViewName("messages/view");
		mav.addObject("message", this.messageRepository.findMessage(id));
		return mav;
	}

	@GetMapping(params = "form")
	public String createForm(@ModelAttribute Message message) {
		return "messages/form";
	}

	@PostMapping
	public ModelAndView create(@Valid Message message, BindingResult result, RedirectAttributes redirect) {
		if (result.hasErrors()) {
			return new ModelAndView("messages/form", "formErrors", result.getAllErrors());
		}
		message = this.messageRepository.save(message);
		redirect.addFlashAttribute("globalMessage", "Successfully created a new message");
		return new ModelAndView("redirect:/{message.id}", "message.id", message.getId());
	}

	@GetMapping(value = "delete/{id}")
	public String delete(@PathVariable("id") Long id) {
		this.messageRepository.deleteMessage(id);
		return "redirect:/";
	}

	@GetMapping(value = "modify/{id}")
	public ModelAndView modifyForm(@PathVariable("id") Long id) {
		ModelAndView mav = new ModelAndView();
		mav.setViewName("messages/form");
		mav.addObject("message", this.messageRepository.findMessage(id));
		return mav;
	}

}
{% endhighlight %}

InMemoryMessageRepository.java
------------------

{% highlight java %}
package com.freud.test.springboot.repository;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

import com.freud.test.springboot.bean.Message;

/**
 * @author Freud
 */
public class InMemoryMessageRepository implements MessageRepository {

	private static AtomicLong counter = new AtomicLong();

	private final ConcurrentMap<Long, Message> messages = new ConcurrentHashMap<Long, Message>();

	@Override
	public Iterable<Message> findAll() {
		return this.messages.values();
	}

	@Override
	public Message save(Message message) {
		Long id = message.getId();
		if (id == null) {
			id = counter.incrementAndGet();
			message.setId(id);
		}
		this.messages.put(id, message);
		return message;
	}

	@Override
	public Message findMessage(Long id) {
		return this.messages.get(id);
	}

	@Override
	public void deleteMessage(Long id) {
		this.messages.remove(id);
	}

}
{% endhighlight %}

MessageRepository.java
------------------

{% highlight java %}
package com.freud.test.springboot.repository;

import com.freud.test.springboot.bean.Message;

/**
 * @author Freud
 */
public interface MessageRepository {

	Iterable<Message> findAll();

	Message save(Message message);

	Message findMessage(Long id);

	void deleteMessage(Long id);

}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/12-web-service-web-pages/02-project-hierarchy.png](/images/blog/spring-boot/12-web-service-web-pages/02-project-hierarchy.png)


运行结果
==================

静态资源
------------------

+ `http://localhost:9090/test/hifreud.html`

![/images/blog/spring-boot/12-web-service-web-pages/03-run-result-static-hifreud.png](/images/blog/spring-boot/12-web-service-web-pages/03-run-result-static-hifreud.png)

+ `http://localhost:9090/test/hi.html`

![/images/blog/spring-boot/12-web-service-web-pages/04-run-result-static-hi.png](/images/blog/spring-boot/12-web-service-web-pages/04-run-result-static-hi.png)

WEB运行结果
------------------

+ `http://localhost:9090/`

![/images/blog/spring-boot/12-web-service-web-pages/05-run-result-message-list.png](/images/blog/spring-boot/12-web-service-web-pages/05-run-result-message-list.png)

+ 点击 `Create Message`

![/images/blog/spring-boot/12-web-service-web-pages/06-run-result-add-message.png](/images/blog/spring-boot/12-web-service-web-pages/06-run-result-add-message.png)

+ 点击`Save`之后显示如下，

![/images/blog/spring-boot/12-web-service-web-pages/07-run-result-message-detail.png](/images/blog/spring-boot/12-web-service-web-pages/07-run-result-message-detail.png)

+ 还可以点击`delete`或者`modify`进行删除或修改操作。也可以点击上方的`Messages`显示是所有Message列表

![/images/blog/spring-boot/12-web-service-web-pages/08-run-result-message-list.png](/images/blog/spring-boot/12-web-service-web-pages/08-run-result-message-list.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

spring-boot-sample-web-thymeleaf3 : [https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-samples/spring-boot-sample-web-thymeleaf3](https://github.com/spring-projects/spring-boot/tree/v1.5.4.RELEASE/spring-boot-samples/spring-boot-sample-web-thymeleaf3)

《JavaEE开发的颠覆者 Spring Boot实战》 - 汪云飞