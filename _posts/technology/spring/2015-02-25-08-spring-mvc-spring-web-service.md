---
layout: post
title:  Spring 使用笔记之(五) - Spring-ws实现基于契约优先的WebService
date:   2015-02-27 10:51:00 +0800
categories: 技术文档
tag: Spring
---

* content
{:toc}


以前写过基于JAXB的传统Java WebService服务端,通过IBM WebSphere Message Broker生成过WebService服务端，最近项目要在Spring MVC搭建的Web项目中添加WebService服务。研究之后发现主流的实现无外乎Apache CXF，Axis 2，Spring WebService。通过对比发现，CXF需要引入的jar依赖太多，Axis 2太重量级，最后选择Spring WebService,主要原因是原有的Web项目是基于Spring MVC的，Spring WebSercice可以与之无缝整合，Spring WebService完全可以支撑现有的业务，并且相对比较轻量级。

> 基于Spring MVC的web项目上可以通过Spring WebService添加Webservice的服务端实现。

Maven依赖
======================
需要的jar包可以通过Maven导入
{% highlight xml %}
<dependency>
	<groupId>org.springframework.ws</groupId>
	<artifactId>spring-ws-core</artifactId>
	<version>2.2.0.RELEASE</version>
</dependency>
<dependency>
	<groupId>jaxen</groupId>
	<artifactId>jaxen</artifactId>
	<version>1.1</version>
</dependency>
<dependency>
	<groupId>wsdl4j</groupId>
	<artifactId>wsdl4j</artifactId>
	<version>1.6.3</version>
</dependency>
{% endhighlight %}

demo.xsd
======================
因为在我们的WebService服务端当中引入了JAXB2，所以整个服务端Endpoint类编写变的简单，同时Spring-WS2.0支持 将XSD文档自动转换成WSDL，这样我们就不用直接编写复杂的WSDL，而只需要编写好XSD文档即可实现WSDL发布。一般来说，一个 WebService的编写是从定义WSDL开始的，对于我们这里来说，因为我们可以将XSD自动转换成WSDL，所以我们就是从编写简单的XSD开始。
<p />
Spring WebService基于约定优于配置的原则，规定所有的入参在定义XSD时要以Request结尾(***Request)，比如我们这里的UserRequest；所有的出站参数要以Response结尾(***Response)，比如我们这里的UserResponse。前面的相同***部分标识为同一个Operation，了解这些之后就可以定义们的XSD文档，具体内容如下：
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

以上定义了一个User的Operation，如参为UserRequest,出参为UserResponse.


Web.xml添加
======================
{% highlight xml %}
<servlet>        
	<servlet-name>spring-ws</servlet-name>         
	<servlet-class>org.springframework.ws.transport.http.MessageDispatcherServlet</servlet-class>
</servlet>   
<servlet-mapping>   
	<servlet-name>spring-ws</servlet-name>   
	<url-pattern>/webservice/*</url-pattern>   
</servlet-mapping> 
{% endhighlight %}

spring-ws-servlet.xml
======================
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:sws="http://www.springframework.org/schema/web-services"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="
	http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
	http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.0.xsd
	http://www.springframework.org/schema/web-services http://www.springframework.org/schema/web-services/web-services-2.0.xsd">
 	<!-- 自动扫描@Endpoint注解 -->
 	<context:component-scan base-package="com.freud.endpoint" />
	<!-- 开启Spring WebService的注解自动扫描驱动 -->
	<sws:annotation-driven/>
	<!-- 动态WSDL的配置 -->
	<sws:dynamic-wsdl id="demo" portTypeName="UserOperation" locationUri="/webservice/demo"
					  targetNamespace="http://www.hifreud.com/ws/demo">
		<sws:xsd location="classpath:demo.xsd" />
	</sws:dynamic-wsdl>
	
</beans> 
{% endhighlight %}

定义UserRequest和UserResponse的实体类
======================
{% highlight java %}
package com.freud.endpoint.bean;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(namespace = "http://www.hifreud.com/ws/demo", name = "UserRequest")
@XmlAccessorType(XmlAccessType.FIELD)
public class UserRequest
{
    @XmlElement(namespace = "http://www.hifreud.com/ws/demo")
    private String userId;
    
    public String getUserId()
    {
        return userId;
    }
    
    public void setUserId(String userId)
    {
        this.userId = userId;
    }
    
}
{% endhighlight %}

<br />

{% highlight java %}
package com.freud.endpoint.bean;
import java.util.Date;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(namespace = "http://www.hifreud.com/ws/demo", name="UserResponse")
@XmlAccessorType(XmlAccessType.FIELD)
public class UserResponse
{
    @XmlElement(namespace = "http://www.hifreud.com/ws/demo")
    private String username;
    
    @XmlElement(namespace = "http://www.hifreud.com/ws/demo")
    private String gender;
    
    @XmlElement(namespace = "http://www.hifreud.com/ws/demo")
    private Date birthday;
    
    @XmlElement(namespace = "http://www.hifreud.com/ws/demo")
    private String location;
    
    public String getUsername()
    {
        return username;
    }
    
    public void setUsername(String username)
    {
        this.username = username;
    }
    
    public String getGender()
    {
        return gender;
    }
    
    public void setGender(String gender)
    {
        this.gender = gender;
    }
    
    public Date getBirthday()
    {
        return birthday;
    }
    
    public void setBirthday(Date birthday)
    {
        this.birthday = birthday;
    }
    
    public String getLocation()
    {
        return location;
    }
    
    public void setLocation(String location)
    {
        this.location = location;
    }
    
}
{% endhighlight %}

> 这两个类非常普通的POJO对象，它们都用到了@XmlRootElement、@XmlAccessorType，这两个annotation由JAXB2提供

UserEndpoint
======================
{% highlight java %}
package com.freud.endpoint;

import java.util.Date;

import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import com.freud.endpoint.bean.UserRequest;
import com.freud.endpoint.bean.UserResponse;

@Endpoint
public class UserEndpoint
{
    @PayloadRoot(namespace = "http://www.hifreud.com/ws/demo", localPart = "UserRequest")
    @ResponsePayload
    public UserResponse findUserById(@RequestPayload
    UserRequest request)
        throws Exception
    {
        
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
可以看到，以上的类中采用了四个annotation，在类上的@Endpoint标明将这个类发布成一个Endpoint服务 类，findUserById方法上有两个annotation：@PayloadRoot用于标明findUserById可以授受的XML信息，这里取的是XML的 namespace为`http://www.hifreud.com/ws/demo`， 同时XML的ROOT为UserRequest的信息；下面的@ResponsePayload标明findUserById方法有返回值，返回值需要回写给 Webservice调用客户端；参数中还有一个@RequestPayload的annotation，它表示从请求负载中取值作为参数，我们这里因为 采用了JAXB2，所以可以将负载的XML消息直接转换成一个名为UserRequest的Java对象。

> 启动服务。将URL定位到`http://localhost:8080/sws/webservice/demo.wsdl?wsdl`

获得WSDL的详细信息如下
======================
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" standalone="no"?><wsdl:definitions xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:sch="http://www.hifreud.com/ws/demo" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:tns="http://www.hifreud.com/ws/demo" targetNamespace="http://www.hifreud.com/ws/demo">
  <wsdl:types>
    <schema xmlns="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified" targetNamespace="http://www.hifreud.com/ws/demo">

	<element name="UserResponse">
		<complexType>
			<sequence>
				<element maxOccurs="1" minOccurs="1" name="username" type="string"/>
				<element maxOccurs="1" minOccurs="1" name="gender" type="string"/>
				<element maxOccurs="1" minOccurs="1" name="birthday" type="date"/>
				<element maxOccurs="1" minOccurs="1" name="location" type="string"/>
			</sequence>
		</complexType>
	</element>

	<element name="UserRequest">
		<complexType>
			<sequence>
				<element maxOccurs="1" minOccurs="1" name="userId" type="string"/>
			</sequence>
		</complexType>
	</element>
</schema>
  </wsdl:types>
  <wsdl:message name="UserResponse">
    <wsdl:part element="tns:UserResponse" name="UserResponse">
    </wsdl:part>
  </wsdl:message>
  <wsdl:message name="UserRequest">
    <wsdl:part element="tns:UserRequest" name="UserRequest">
    </wsdl:part>
  </wsdl:message>
  <wsdl:portType name="UserOperation">
    <wsdl:operation name="User">
      <wsdl:input message="tns:UserRequest" name="UserRequest">
    </wsdl:input>
      <wsdl:output message="tns:UserResponse" name="UserResponse">
    </wsdl:output>
    </wsdl:operation>
  </wsdl:portType>
  <wsdl:binding name="UserOperationSoap11" type="tns:UserOperation">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="User">
      <soap:operation soapAction=""/>
      <wsdl:input name="UserRequest">
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output name="UserResponse">
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
  <wsdl:service name="UserOperationService">
    <wsdl:port binding="tns:UserOperationSoap11" name="UserOperationSoap11">
      <soap:address location="/webservice/demo"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>
{% endhighlight %}

使用SOAP-UI测试结果
======================

![测试结果](/images/blog/spring/08-spring-web-service/01_test_result.png)

<br/>
<br/>

参考资料
======================

[Spring-ws示例WebService开发](http://www.360doc.com/content/13/0121/10/10825198_261510029.shtml)


[Spring WebService官方文档(英文)](http://docs.spring.io/spring-ws/docs/2.2.0.RELEASE/reference/htmlsingle/)


<br/>
<br/>