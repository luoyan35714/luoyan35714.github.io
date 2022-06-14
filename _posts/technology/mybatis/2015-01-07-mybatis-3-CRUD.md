---
layout: post
title:  mybatis-系列教程(三)-实现数据的增删改查（CRUD）
date:   2015-01-07 20:58:01 +0800
category : 技术文档
tag : mybatis
---

* content
{:toc}


所需要用到的其他工具或技术
=================================

| 项目管理工具 | Maven |
| 测试运行工具 | Junit |
| 数据库 | Derby |

废话不多说,直接代码

Maven Dependencies
=================================

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

SQL 建表及数据插入（沿用前两节中的数据库表及数据）
=================================

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

Mybatis配置文件
=================================

`src/main/resource`源目录下

test-mybatis-configuration.xml
---------------------------------

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
{% endhighlight%}

User.java对象类
---------------------------------

`src/main/java/com/freud/practice`目录下

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
{% endhighlight%}

UserMapper.xml
---------------------------------

Mapper文件`src/main/java/com.freud.practice`目录下

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

	<!-- 插入 -->
	<insert id="insertUser">
		insert into 
			USER_TEST_TB 
		values(#{id},#{username},#{password},#{nickname})
	</insert>

	<!-- 更新 -->
	<update id="updateUser">
		update USER_TEST_TB set
    		USERNAME = #{username},
   	 		PASSWORD = #{password},
    		NICKNAME = #{nickname}
		where ID = #{id}
	</update>

	<!-- 删除 -->
	<delete id="deleteUser">
		delete from USER_TEST_TB WHERE ID=#{id}
	</delete>
</mapper>
{% endhighlight%}

UserMapper.java
---------------------------------

Mapper类`src/main/java/com.freud.practice`目录下

{% highlight java %}
package com.freud.practice;

import java.util.List;

public interface UserMapper
{

	public List<User> getUser();

	public void insertUser(User user);

	public void updateUser(User user);

	public void deleteUser(int userId);
}
{% endhighlight%}

测试类TestMyBatis.java
---------------------------------

`src/test/java/com.freud.practice`目录下

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
	public void testGet()
	{
		try
		{
			// 获取Session连接
			SqlSession session = sqlSessionFactory.openSession();

			// 获取Mapper
			UserMapper userMapper = session.getMapper(UserMapper.class);

			// 显示User信息
			System.out.println("Test Get start...");
			this.printUsers(userMapper.getUser());
			System.out.println("Test Get finished...");
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
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

	@Test
	public void testUpdate()
	{
		try
		{
			// 获取Session连接
			SqlSession session = sqlSessionFactory.openSession();

			// 获取Mapper
			UserMapper userMapper = session.getMapper(UserMapper.class);

			System.out.println("Test update start...");
			// 显示更新之前User信息
			System.out.println("Before update");
			this.printUsers(userMapper.getUser());

			// 执行更新
			userMapper.updateUser(this.mockUser("FREU_UPD_USER", "FREUD_UPD_PASS", "FREUD_UPD_NICK"));
			// 提交事务
			session.commit();
			
			// 显示更新之后User信息
			System.out.println("\r\nAfter update");
			this.printUsers(userMapper.getUser());

			System.out.println("Test update finished...");
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

	@Test
	public void testDelete()
	{
		try
		{
			// 获取Session连接
			SqlSession session = sqlSessionFactory.openSession();

			// 获取Mapper
			UserMapper userMapper = session.getMapper(UserMapper.class);

			System.out.println("Test delete start...");
			// 显示删除之前User信息
			System.out.println("Before delete");
			this.printUsers(userMapper.getUser());

			// 执行删除
			userMapper.deleteUser(this.mockUser(null, null, null).getId());
			// 提交事务
			session.commit();
						
			// 显示删除之后User信息
			System.out.println("\r\nAfter delete");
			this.printUsers(userMapper.getUser());
			System.out.println("Test delete finished...");

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
		user.setId(10);
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
{% endhighlight%}

简单的增删改查完事。接下来就是如何对DB的列名和对象属性名不同情况的匹配了，

即下一节要写的--> 实现表数据与对象的关联关系

<br/>
<br/>