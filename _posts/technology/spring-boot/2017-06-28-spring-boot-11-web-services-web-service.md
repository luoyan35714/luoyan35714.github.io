---
layout: post
title:  Spring Boot学习笔记(十一) - 构建web服务 - WebService
date:   2017-06-28 09:33:00 +0800
categories: Spring-Boot
tag: 教程
---

* content
{:toc}


WebService服务
==================

关于什么是WebService可以参考W3SCHOOL的教程[Web Services 教程](http://www.w3school.com.cn/webservices/index.asp)

Spring Boot提供Web Services自动配置，你需要的就是定义 Endpoints 。通过添加 spring-boot-starter-webservices 模块可以获取Spring Web Services特性。

需要添加的依赖如下:

{% highlight xml %}
<!-- Spring Web Service -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web-services</artifactId>
</dependency>
<!-- WSDL -->
<dependency>
  <groupId>wsdl4j</groupId>
  <artifactId>wsdl4j</artifactId>
</dependency>
{% endhighlight %}

对于普通项目使用Spring实现webservice可以参考[Spring 使用笔记之(五) - Spring-ws实现基于契约优先的WebService](http://www.hifreud.com/2015/02/27/08-spring-mvc-spring-web-service/).


实验
==================

创建一个Maven项目
------------------

![/images/blog/spring-boot/11-web-service-web-service/01-new-maven-project.png](/images/blog/spring-boot/11-web-service-web-service/01-new-maven-project.png)

pom.xml
------------------

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.freud.test</groupId>
	<artifactId>spring-boot-11</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>spring-boot-11</name>
	<url>http://maven.apache.org</url>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<!-- Spring Web Service -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web-services</artifactId>
		</dependency>
		<!-- WSDL -->
		<dependency>
			<groupId>wsdl4j</groupId>
			<artifactId>wsdl4j</artifactId>
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
    name: test-11
server:
  port: 9090
{% endhighlight %}

demo.xsd
------------------

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<schema targetNamespace="http://www.hifreud.com/ws/demo"
	elementFormDefault="qualified" xmlns="http://www.w3.org/2001/XMLSchema"
	xmlns:tns="http://www.hifreud.com/ws/demo">

	<element name="UserResponse">
		<complexType>
			<sequence>
				<element name="username" type="string" maxOccurs="1" minOccurs="1" />
				<element name="gender" type="string" maxOccurs="1" minOccurs="1" />
				<element name="birthday" type="date" maxOccurs="1" minOccurs="1" />
				<element name="location" type="string" maxOccurs="1" minOccurs="1" />
			</sequence>
		</complexType>
	</element>

	<element name="UserRequest">
		<complexType>
			<sequence>
				<element name="userId" type="string" minOccurs="1" maxOccurs="1"/>
			</sequence>
		</complexType>
	</element>
</schema>
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

UserRequest.java
------------------

{% highlight java %}
package com.freud.test.springboot.bean;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Freud
 */
@XmlRootElement(namespace = "http://www.hifreud.com/ws/demo", name = "UserRequest")
@XmlAccessorType(XmlAccessType.FIELD)
public class UserRequest {

	@XmlElement(namespace = "http://www.hifreud.com/ws/demo")
	private String userId;

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

}
{% endhighlight %}

UserResponse.java
------------------

{% highlight java %}
package com.freud.test.springboot.bean;

import java.util.Date;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Freud
 */
@XmlRootElement(namespace = "http://www.hifreud.com/ws/demo", name = "UserResponse")
@XmlAccessorType(XmlAccessType.FIELD)
public class UserResponse {

	@XmlElement(namespace = "http://www.hifreud.com/ws/demo")
	private String username;

	@XmlElement(namespace = "http://www.hifreud.com/ws/demo")
	private String gender;

	@XmlElement(namespace = "http://www.hifreud.com/ws/demo")
	private Date birthday;

	@XmlElement(namespace = "http://www.hifreud.com/ws/demo")
	private String location;

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public Date getBirthday() {
		return birthday;
	}

	public void setBirthday(Date birthday) {
		this.birthday = birthday;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

}
{% endhighlight %}

WsConfig.java
------------------

{% highlight java %}
package com.freud.test.springboot.config;

import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.ws.config.annotation.EnableWs;
import org.springframework.ws.config.annotation.WsConfigurerAdapter;
import org.springframework.ws.transport.http.MessageDispatcherServlet;
import org.springframework.ws.wsdl.wsdl11.DefaultWsdl11Definition;
import org.springframework.xml.xsd.SimpleXsdSchema;
import org.springframework.xml.xsd.XsdSchema;

/**
 * @author Freud
 */
@EnableWs
@Configuration
public class WsConfig extends WsConfigurerAdapter {

	@Bean
	public ServletRegistrationBean messageDispatcherServlet(ApplicationContext applicationContext) {
		MessageDispatcherServlet servlet = new MessageDispatcherServlet();
		servlet.setApplicationContext(applicationContext);
		servlet.setTransformWsdlLocations(true);
		return new ServletRegistrationBean(servlet, "/ws/*");
	}

	@Bean(name = "users")
	public DefaultWsdl11Definition defaultWsdl11Definition(XsdSchema countriesSchema) {
		DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
		wsdl11Definition.setPortTypeName("UserRequest");
		wsdl11Definition.setLocationUri("/ws");
		wsdl11Definition.setTargetNamespace("http://www.hifreud.com/webservice");
		wsdl11Definition.setSchema(countriesSchema);
		return wsdl11Definition;
	}

	@Bean
	public XsdSchema usersSchema() {
		return new SimpleXsdSchema(new ClassPathResource("demo.xsd"));
	}
}
{% endhighlight %}

UserEndpoint.java
------------------

{% highlight java %}
package com.freud.test.springboot.endpoint;

import java.util.Date;

import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import com.freud.test.springboot.bean.UserRequest;
import com.freud.test.springboot.bean.UserResponse;

/**
 * @author Freud
 */
@Endpoint
public class UserEndpoint {

	@PayloadRoot(namespace = "http://www.hifreud.com/ws/demo", localPart = "UserRequest")
	@ResponsePayload
	public UserResponse findUserById(@RequestPayload UserRequest request) throws Exception {

		System.out.println(request.getUserId());

		UserResponse response = new UserResponse();
		response.setUsername("Freud");
		response.setGender("Male");
		response.setLocation("Dalian");
		response.setBirthday(new Date());

		return response;
	}

}
{% endhighlight %}

项目结构
------------------

![/images/blog/spring-boot/11-web-service-web-service/02-project-hierarchy.png](/images/blog/spring-boot/11-web-service-web-service/02-project-hierarchy.png)

WSDL
------------------

在浏览器输入 `http://localhost:9090/ws/users.wsdl?wsdl` 查看WSDL定义。

![/images/blog/spring-boot/11-web-service-web-service/03-wsdl-definition.png](/images/blog/spring-boot/11-web-service-web-service/03-wsdl-definition.png)


执行测试
==================

导入WSDL
------------------

打开SOAP-UI，依次点击 `File` -> `New SOAP Project`, 在Initial WSDL中输入`http://localhost:9090/ws/users.wsdl?wsdl`

![/images/blog/spring-boot/11-web-service-web-service/04-import-wsdl.png](/images/blog/spring-boot/11-web-service-web-service/04-import-wsdl.png)

创建Test Case
------------------

在生成的项目`users`上右键，然后选择`New TestSuite`, 生成`TestSuite`，然后在生成的`TestSuite 1`上右键选择`New TestCase`, 生成`TestCase`。在生成的`TestCase 1`下面的`Test Steps`上右键，依次选择 `Add Step` -> `Test Request`，在弹出的对话框上选择`UserRequestSoap11->User`，然后点击确定。生成的项目树如下：

![/images/blog/spring-boot/11-web-service-web-service/05-soap-ui-project-hierarchy.png](/images/blog/spring-boot/11-web-service-web-service/05-soap-ui-project-hierarchy.png)

执行测试
------------------

在右侧的操作区，点击`Submit request to specified endpoint URL`发送请求。运行成功结果如下：

![/images/blog/spring-boot/11-web-service-web-service/06-soap-ui-run-result.png](/images/blog/spring-boot/11-web-service-web-service/06-soap-ui-run-result.png)


参考资料
==================

Spring Boot Reference Guide : [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/)

Spring Web Services Reference Documentation : [http://docs.spring.io/spring-ws/docs/2.3.0.RELEASE/reference/htmlsingle/](http://docs.spring.io/spring-ws/docs/2.3.0.RELEASE/reference/htmlsingle/)

 spring boot集成web service框架教程 : [http://blog.csdn.net/u011410529/article/details/68063541?winzoom=1](http://blog.csdn.net/u011410529/article/details/68063541?winzoom=1)