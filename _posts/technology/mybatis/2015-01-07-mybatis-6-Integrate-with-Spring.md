---
layout: post
title:  mybatis-系列教程(六)-与Spring集成（Integrate with Spring）
date:   2015-01-07 21:16:01 +0800
category : 技术文档
tag : mybatis
---

* content
{:toc}


所需要用到的其他工具或技术
======================

| 项目管理工具 | Maven |
| 前台WEB展示 | JSP |
| 其他框架 | Spring, Spring MVC |
| 数据库 | Derby |

新建一个Maven的Web项目

Maven Dependencies
======================

{% highlight xml %}
<!-- Spring -->
<dependency>
	<groupId>org.springframework</groupId>
	<artifactId>spring-context</artifactId>
	<version>4.0.0.RELEASE</version>
</dependency>
<dependency>
	<groupId>org.springframework</groupId>
	<artifactId>spring-webmvc</artifactId>
	<version>4.0.0.RELEASE</version>
</dependency>

<dependency>
	<groupId>org.springframework</groupId>
	<artifactId>spring-tx</artifactId>
	<version>4.0.0.RELEASE</version>
</dependency>
<dependency>
	<groupId>org.springframework</groupId>
	<artifactId>spring-jdbc</artifactId>
	<version>4.0.0.RELEASE</version>
</dependency>

<!-- AspectJ -->
<dependency>
	<groupId>org.aspectj</groupId>
	<artifactId>aspectjrt</artifactId>
	<version>1.6.10</version>
</dependency>

<!-- Logging -->
<dependency>
	<groupId>org.slf4j</groupId>
	<artifactId>slf4j-api</artifactId>
	<version>1.6.6</version>
</dependency>
<dependency>
	<groupId>org.slf4j</groupId>
	<artifactId>jcl-over-slf4j</artifactId>
	<version>1.6.6</version>
	<scope>runtime</scope>
</dependency>
<dependency>
	<groupId>org.slf4j</groupId>
	<artifactId>slf4j-log4j12</artifactId>
	<version>1.6.6</version>
	<scope>runtime</scope>
</dependency>

<!-- @Inject -->
<dependency>
	<groupId>javax.inject</groupId>
	<artifactId>javax.inject</artifactId>
	<version>1</version>
</dependency>

<!-- Servlet -->
<dependency>
	<groupId>javax.servlet</groupId>
	<artifactId>servlet-api</artifactId>
	<version>2.5</version>
	<scope>provided</scope>
</dependency>
<dependency>
	<groupId>javax.servlet.jsp</groupId>
	<artifactId>jsp-api</artifactId>
	<version>2.1</version>
	<scope>provided</scope>
</dependency>
<dependency>
	<groupId>javax.servlet</groupId>
	<artifactId>jstl</artifactId>
	<version>1.2</version>
</dependency>

<!-- Mybatis -->
<dependency>
	<groupId>org.mybatis</groupId>
	<artifactId>mybatis</artifactId>
	<version>3.2.7</version>
</dependency>
<dependency>
	<groupId>org.mybatis</groupId>
	<artifactId>mybatis-spring</artifactId>
	<version>1.2.1</version>
</dependency>

<!-- Test -->
<dependency>
	<groupId>junit</groupId>
	<artifactId>junit</artifactId>
	<version>4.9</version>
	<scope>test</scope>
</dependency>

<!-- Derby -->
<dependency>
	<groupId>org.apache.derby</groupId>
	<artifactId>derby</artifactId>
	<version>10.10.2.0</version>
</dependency>
<dependency>
	<groupId>org.apache.derby</groupId>
	<artifactId>derbyclient</artifactId>
	<version>10.10.2.0</version>
</dependency>
{% endhighlight %}

SQL建表及数据插入（如果前文作过，可以忽略）
{% highlight sql %}
CREATE TABLE USER_TEST_TB(  
ID INT PRIMARY KEY,  
USERNAME VARCHAR(20) NOT NULL,  
PASSWORD VARCHAR(20) NOT NULL,  
NICKNAME VARCHAR(20) NOT NULL  
);  
  
INSERT INTO USER_TEST_TB VALUES(1,'1st','111','Jack');  
INSERT INTO USER_TEST_TB VALUES(2,'2nd','222','Rose');  
INSERT INTO USER_TEST_TB VALUES(3,'3rd','333','Will');  
{% endhighlight %}

web.xml（scr/main/webapp/WEB-INF下）
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.5" xmlns="http://java.sun.com/xml/ns/javaee"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd">
	
	<!-- Spring 的配置 -->
	<context-param>
		<param-name>contextConfigLocation</param-name>
		<param-value>/WEB-INF/*Context.xml</param-value>
	</context-param>
	
	<listener>
		<listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
	</listener>

	<servlet>
		<servlet-name>appServlet</servlet-name>
		<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
		<load-on-startup>1</load-on-startup>
	</servlet>
		
	<servlet-mapping>
		<servlet-name>appServlet</servlet-name>
		<url-pattern>/</url-pattern>
	</servlet-mapping>

</web-app>
{% endhighlight %}

appServlet-servlet.xml（Spring的Servlet配置文件scr/main/webapp/WEB-INF下）
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<beans:beans xmlns="http://www.springframework.org/schema/mvc"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:beans="http://www.springframework.org/schema/beans"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd
		http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
	
	<!-- 开启Annotation支持 -->
	<annotation-driven />

	<!-- Spring的渲染层配置 -->
	<beans:bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
		<beans:property name="prefix" value="/WEB-INF/views/" />
		<beans:property name="suffix" value=".jsp" />
	</beans:bean>
	
	<!-- Spring的Annotation默认扫描包 -->
	<context:component-scan base-package="com.freud.practice" />
	
	<!-- 引入其他Spring配置文件 -->
	<beans:import resource="classpath:applicationContext.xml" />
	
</beans:beans>
{% endhighlight %}

JSP文件
======================

show.jsp
---------------------

`src/main/webapp/WEB-INF/views`目录下

{% highlight html %}
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Show All Users</title>
<style type="text/css">
*{
margin: 0px;
padding: 0px;
}
</style>
</head>
<body>

	<table border="1px" bordercolor="green">
		<thead>
			<tr>
				<th>USER_NAME</th>
				<th>PASSWORD</th>
				<th>NICK_NAME</th>
				<th>EDIT</th>
				<th>DELETE</th>
			</tr>
			<c:forEach items="${users}" var="user" varStatus="status">
				<tr>
					<td>${user.username}</td>
					<td>${user.password}</td>
					<td>${user.nickname}</td>
					<td><a href="update/${user.id}">edit</a></td>
					<td><a href="delete/${user.id}">delete</a></td>
				</tr>
			</c:forEach>
		</thead>
	</table>
	<a href="insert">Add new User</a>
</body>
</html>
{% endhighlight %}

update.jsp
---------------------

`src/main/webapp/WEB-INF/views`目录下

{% highlight html %}
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Update Profile</title>
</head>
<body>
	<form action="${user.id}" method="post">
		User ID:${user.id}<br>
		Username:<input type="text" name="username" value="${user.username}"/><br>
		Password:<input type="text" name="password" value="${user.password}"/><br>
		Nickname:<input type="text" name="nickname" value="${user.nickname}"/><br>
		<input type="submit" value="submit">
	</form>
</body>
</html>
{% endhighlight %}

insert.jsp
---------------------

`src/main/webapp/WEB-INF/views`目录下

{% highlight html %}
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Insert Profile</title>
</head>
<body>

	<form action="" method="post">
		User Id:<input type="text" name="id"><br>
		Username:<input type="text" name="username" /><br>
		Password:<input type="text" name="password"/><br>
		Nickname:<input type="text" name="nickname"/><br>
		<input type="submit" value="submit">
	</form>
</body>
</html>
{% endhighlight %}

applicationContext.xml
---------------------

`Spring的Application配置文件在src/main/resources目录下`

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:aop="http://www.springframework.org/schema/aop"
	xmlns:context="http://www.springframework.org/schema/context"
	xmlns:lang="http://www.springframework.org/schema/lang" xmlns:mvc="http://www.springframework.org/schema/mvc"
	xmlns:tx="http://www.springframework.org/schema/tx"
	xmlns:mybatis-spring="http://mybatis.org/schema/mybatis-spring"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-4.0.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.0.xsd
		http://www.springframework.org/schema/lang http://www.springframework.org/schema/lang/spring-lang-4.0.xsd
		http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-4.0.xsd
		http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-4.0.xsd
		http://mybatis.org/schema/mybatis-spring http://mybatis.org/schema/mybatis-spring-1.2.xsd">

	<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
		<property name="basePackage" value="com.freud.practice" />
		<property name="sqlSessionFactoryBeanName" value="derbySqlSessionFactory" />
	</bean>

	<!-- 配置Derby驱动数据源 -->
	<bean id="derbyDataSource"
		class="org.springframework.jdbc.datasource.DriverManagerDataSource">
		<property name="driverClassName" value="org.apache.derby.jdbc.ClientDriver" />
		<property name="url" value="jdbc:derby://localhost:1527/freud;create=true" />
	</bean>

	<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean"
		name="derbySqlSessionFactory">
		<property name="dataSource" ref="derbyDataSource" />
		<property name="mapperLocations" value="classpath*:com/freud/practice/*Mapper.xml" />
	</bean>

    <!-- 事务管理器 -->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="derbyDataSource" />
    </bean>

    <!-- 开启基于注解的事务 -->
    <tx:annotation-driven />
</beans>
{% endhighlight %}

Java文件
======================

UserController.java
--------------------------------

在`src/main/java/com.freud.practice.controller`目录下

{% highlight java %}
package com.freud.practice.controller;

import com.freud.practice.User;
import com.freud.practice.UserMapper;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@EnableWebMvc
@Controller
public class UserController
{

	@Autowired
	private UserMapper userMapper;

	/**
	 * 
	 * 获得所有的User信息
	 * 
	 * @param model
	 * @return
	 */
	@RequestMapping(value = {"/", ""}, method = RequestMethod.GET)
	public String getAllUser(Model model)
	{
		List<User> users = userMapper.getUsers();
		System.out.println("Show all user size:" + users.size());
		model.addAttribute("users", users);
		return "show";
	}

	/**
	 * 
	 * INSERT的GET请求，跳转到Insert的View即insert.jsp
	 * 
	 * @return
	 */
	@RequestMapping(value = {"/insert", ""}, method = RequestMethod.GET)
	public String insertUser()
	{
		return "insert";
	}

	/**
	 * 
	 * INSERT的POST请求，执行插入操作并返回ShowAll页面
	 * 
	 * @param user
	 * @return
	 */
	@RequestMapping(value = {"/insert", ""}, method = RequestMethod.POST)
	public String insertUserPOST(User user)
	{
		userMapper.insertUser(user);
		return "redirect:/";
	}

	/**
	 * 
	 * UPDATE的GET请求，跳转到update的View即update.jsp
	 * 
	 * @param id
	 * @param model
	 * @return
	 */
	@RequestMapping(value = {"/update/{id}", ""}, method = RequestMethod.GET)
	public String updateUser(@PathVariable String id, Model model)
	{
		model.addAttribute("user", userMapper.getUser(Integer.valueOf(id)));
		return "update";
	}

	/**
	 * 
	 * UPDATE的POST请求，执行更新操作并返回ShowAll页面
	 * 
	 * @param id
	 * @param user
	 * @return
	 */
	@RequestMapping(value = {"/update/{id}", ""}, method = RequestMethod.POST)
	public String updateUserPOST(@PathVariable String id, User user)
	{
		userMapper.updateUser(user);
		return "redirect:/";
	}

	/**
	 * 
	 * 通过Id删除USER
	 * 
	 * @param id
	 * @return
	 */
	@RequestMapping(value = {"/delete/{id}", ""}, method = RequestMethod.GET)
	public String deleteUser(@PathVariable int id)
	{
		userMapper.deleteUser(id);
		return "redirect:/";
	}
}
{% endhighlight %}

User.java
--------------------------------

在`src/main/java/com.freud.practice`目录下

{% highlight java %}
package com.freud.practice;

/**
 * 
 * User 对象。
 * 
 * @author Freud Kang
 * 
 */
public class User
{

	private Integer id;

	private String username;

	private String password;

	private String nickname;

	public Integer getId()
	{
		return id;
	}

	public void setId(Integer id)
	{
		this.id = id;
	}

	public String getUsername()
	{
		return username;
	}

	public void setUsername(String username)
	{
		this.username = username;
	}

	public String getPassword()
	{
		return password;
	}

	public void setPassword(String password)
	{
		this.password = password;
	}

	public String getNickname()
	{
		return nickname;
	}

	public void setNickname(String nickname)
	{
		this.nickname = nickname;
	}

}
{% endhighlight %}

UserMapper.java
--------------------------------

在`src/main/java/com.freud.practice`目录下

{% highlight java %}
package com.freud.practice;

import java.util.List;

public interface UserMapper
{

	/**
	 * 
	 * 获得所有User
	 * 
	 * @return
	 */
	public List<User> getUsers();

	/**
	 * 
	 * 通过Id获得User
	 * 
	 * @param id
	 * @return
	 */
	public User getUser(int id);

	/**
	 * 
	 * 插入User
	 * 
	 * @param user
	 */
	public void insertUser(User user);

	/**
	 * 
	 * 更新User
	 * 
	 * @param user
	 */
	public void updateUser(User user);

	/**
	 * 
	 * 通过Id删除User
	 * 
	 * @param userId
	 */
	public void deleteUser(int userId);
}
{% endhighlight %}

UserMapper.xml
--------------------------------

mybatis的mapper配置文件，在`src/main/java/com.freud.practice`目录下

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>  
<!DOCTYPE mapper  
 PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"  
 "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.freud.practice.UserMapper">

	<!-- 查询 -->
	<select id="getUsers" resultType="com.freud.practice.User">
		select *
		from USER_TEST_TB
	</select>

	<!-- 查询 -->
	<select id="getUser" resultType="com.freud.practice.User">
		select *
		from USER_TEST_TB
		where ID=#{id}
	</select>
	
	<!-- 插入 -->
	<insert id="insertUser">
		insert into 
			USER_TEST_TB 
		values(#{id},#{username},#{password},#{nickname})
	</insert>

	<!-- 更改 -->
	<update id="updateUser">
		update USER_TEST_TB set
    		USERNAME = #{username},
   	 		PASSWORD = #{password},
    		NICKNAME = #{nickname}
		where ID = #{id}
	</update>

	<!-- 删除 -->
	<delete id="deleteUser">
		delete from USER_TEST_TB where ID=#{id}
	</delete>
</mapper>  
{% endhighlight %}

<br/>
<br/>
