---
layout: post
title:  mybatis-系列教程(五)-处理存储过程(Handle the Store Procedure)
date:   2015-01-07 21:15:01 +0800
category : 技术文档
tag : mybatis
---

* content
{:toc}


所需要用到的其他工具或技术
---------------------

| 项目管理工具 | Maven |
| 测试运行工具 | Junit |
| 数据库 | Derby |

本节需要用到的有2部分，第一部分是如何在Derby中创建存储过程，第二部分是如何在Mybatis中调用存储过程

一. 在Derby中创建存储过程
--------------------

- 在Eclipse中创建一个新的普通java项目命名为Test_Store_Procedure
- 在com.freud.practice包下创建一个Class命名为StoreProcedureOperationClass.class
{% highlight java %}
package com.freud.practice;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * 
 * 存储过程类
 * 
 * @author Freud
 * 
 */
public class StoreProcedureOperationClass
{

	/**
	 * 
	 * 执行插入的存储过程
	 * 
	 * @param id
	 * @param username
	 * @param password
	 * @param nickname
	 * @throws SQLException
	 */
	public static void insertData(int id, String username, String password, String nickname) throws SQLException
	{

		Connection connection = DriverManager.getConnection("jdbc:default:connection");

		PreparedStatement p =
		        connection.prepareStatement("INSERT INTO USER_TEST_TB(ID,USERNAME,PASSWORD,NICKNAME) VALUES(?,?,?,?)");

		p.setInt(1, id);
		p.setString(2, username);
		p.setString(3, password);
		p.setString(4, nickname);

		System.out.println("INSERT VALUES (id=" + id + ",username=" + username + ",password=" + password + ",nickname="
		        + nickname + ")");
		p.executeUpdate();
		p.close();

		connection.close();
	}
}
{% endhighlight %}
- 利用jar命令或者Eclipse工具导出到C:\freud\Test_Store_Procedure.jar
- 在ij命令行中声明存储过程
{% highlight sql %}
CREATE PROCEDURE FREUD.INSERT_USER(IN THE_ID INTEGER, 
                  IN THE_USERNAME VARCHAR(20), IN THE_PASSWORD VARCHAR(20), IN THE_NICKNAME VARCHAR(20)) 
PARAMETER STYLE JAVA MODIFIES SQL DATA LANGUAGE JAVA 
EXTERNAL NAME 'com.freud.practice.StoreProcedureOperationClass.insertData';
{% endhighlight %}
- 在 ij 控制台中调用call sqlj.install_jar('C:\freud\Test_Store_Procedure.jar', 'FREUD.TEST_SPROCEDURE', 0);将 jar 包导入到 FREUD模式中，并命名为TEST_SPROCEDURE。
- 在 ij 控制台中调用call SYSCS_UTIL.SYSCS_SET_DATABASE_PROPERTY('derby.database.classpath', 'FREUD.TEST_SPROCEDURE'); 将 jar 包加入到数据库 classpath 搜索路径中。

这样，Derby的存储过程就算创建完成了（更多的Derby存储过程信息参照[Apache Derby](https://db.apache.org/derby/docs/10.1/ref/rrefcreateprocedurestatement.html)）

二.在Mybatis中调用存储过程
-------------------------
Maven Dependencies:
{% highlight xml %}
<dependencies>
	<dependency>
		<groupId>org.mybatis</groupId>
		<artifactId>mybatis</artifactId>
		<version>3.2.7</version>
	</dependency>
	<dependency>
		<groupId>junit</groupId>
		<artifactId>junit</artifactId>
		<version>4.9</version>
		<scope>test</scope>
	</dependency>
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
</dependencies>
{% endhighlight %}

Mybatis配置文件 src/main/resource源目录下

test-mybatis-configuration.xml
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>  
<!DOCTYPE configuration  
  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"  
  "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
	<properties>
		<property name="driver" value="org.apache.derby.jdbc.ClientDriver" />
		<property name="url"
			value="jdbc:derby://localhost:1527/freud;create=true" />
	</properties>
	<environments default="development">
		<environment id="development">
			<transactionManager type="JDBC" />
			<dataSource type="POOLED">
				<property name="driver" value="${driver}" />
				<property name="url" value="${url}" />
			</dataSource>
		</environment>
	</environments>
	<mappers>
		<mapper resource="com/freud/practice/UserMapper.xml" />
	</mappers>
</configuration>
{% endhighlight %}

User.java对象类(src/main/java/com/freud/practice目录下)
{% highlight java %}
package com.freud.practice;

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

UserMapper.xml  Mapper文件（src/main/java/com.freud.practice目录下）
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>  
<!DOCTYPE mapper  
 PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"  
 "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.freud.practice.UserMapper">

	<!-- 查询 -->
	<select id="getUser" resultType="com.freud.practice.User">
		select *
		from USER_TEST_TB
	</select>
	
	<!-- 调用插入的存储过程 -->
	<insert id="insertUser" statementType="CALLABLE">
		CALL FREUD.INSERT_USER(#{id},#{username},#{password},#{nickname})
	</insert>
</mapper>  
{% endhighlight %}

UserMapper.java Mapper类（src/main/java/com.freud.practice目录下）
{% highlight java %}
package com.freud.practice;

import java.util.List;

public interface UserMapper
{

	public List<User> getUser();

	public void insertUser(User user);

}
{% endhighlight %}

测试类TestMyBatis.java（src/test/java/com.freud.practice目录下）
{% highlight java %}
package com.freud.practice;

import java.io.InputStream;
import java.text.MessageFormat;
import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.junit.Before;
import org.junit.Test;

public class TestMyBatis
{

	private String source;

	private InputStream inputStream;

	private SqlSessionFactory sqlSessionFactory;

	@Before
	public void setUp()
	{
		/**
		 * 准备Mybatis运行环境
		 */
		source = "test-mybatis-configuration.xml";
		inputStream = TestMyBatis.class.getClassLoader().getResourceAsStream(source);
		sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);

	}


	@Test
	public void testInsert()
	{
		try
		{
			// 获取Session连接
			SqlSession session = sqlSessionFactory.openSession();

			// 获取Mapper
			UserMapper userMapper = session.getMapper(UserMapper.class);

			System.out.println("Test insert start...");
			// 显示插入之前User信息
			System.out.println("Before insert");
			this.printUsers(userMapper.getUser());

			// 执行插入
			userMapper.insertUser(this.mockUser("FREU_INS_USER", "FREUD_INS_PASS", "FREUD_INS_NICK"));
			// 提交事务
			session.commit();

			// 显示插入之后User信息
			System.out.println("\r\nAfter insert");
			this.printUsers(userMapper.getUser());
			System.out.println("Test insert finished...");
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

	/**
	 * 
	 * 组装一个User对象
	 * 
	 * @return
	 */
	public User mockUser(String username, String password, String nickname)
	{
		User user = new User();
		user.setId(50);
		user.setUsername(username);
		user.setPassword(password);
		user.setNickname(nickname);
		return user;
	}

	/**
	 * 
	 * 打印用户信息到控制台
	 * 
	 * @param users
	 */
	private void printUsers(final List<User> users)
	{
		int count = 0;

		for (User user : users)
		{
			System.out.println(MessageFormat.format("==User[{0}]=================", ++count));
			System.out.println("User Id: " + user.getId());
			System.out.println("User UserName: " + user.getUsername());
			System.out.println("User Password: " + user.getPassword());
			System.out.println("User nickname: " + user.getNickname());
		}
	}
}
{% endhighlight %}

<br/>
<br/>
