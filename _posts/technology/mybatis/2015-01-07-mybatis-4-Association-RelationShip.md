---
layout: post
title:  mybatis-系列教程(四)-实现表数据与对象的关联关系(Association RelationShip)
date:   2015-01-07 21:03:01 +0800
category : 技术文档
tag : mybatis
---

* content
{:toc}


所需要用到的其他工具或技术
==============================

| 项目管理工具 | Maven |
| 测试运行工具 | Junit |
| 数据库 | Derby |

Maven Dependencies
==============================

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


SQL 建表及数据插入
==============================

`新建一个USER_TEST_TB_RELATIONSHIP表，然后CopyUSER_TEST_TB的数据，Derby不支持表结构中列名的修改，只能这么做了`

{% highlight sql %}
CREATE TABLE USER_TEST_TB_RELATIONSHIP(
USER_ID INT PRIMARY KEY,    
USER_USERNAME VARCHAR(20) NOT NULL,    
USER_PASSWORD VARCHAR(20) NOT NULL,    
USER_NICKNAME VARCHAR(20) NOT NULL    
);

INSERT INTO USER_TEST_TB_RELATIONSHIP(USER_ID,USER_USERNAME,USER_PASSWORD,USER_NICKNAME) SELECT ID,USERNAME,PASSWORD,NICKNAME FROM USER_TEST_TB;
{% endhighlight %}

Mybatis配置文件 
==============================

`src/main/resource`源目录下

test-mybatis-configuration.xml
---------------------

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

User.java对象类
---------------------

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
{% endhighlight %}

UserMapper.xml 
---------------------

Mapper文件`src/main/java/com.freud.practice`目录下

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>  
<!DOCTYPE mapper  
 PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"  
 "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.freud.practice.UserMapper">

	<!-- 对象属性和表字段的对应 -->
	<resultMap id="userResultMap" type="com.freud.practice.User">
		<result property="id" column="USER_ID"/>
		<result property="username" column="USER_USERNAME"/>
		<result property="password" column="USER_PASSWORD"/>
		<result property="nickname" column="USER_NICKNAME"/>
	</resultMap>
	
	<select id="getUser" resultMap="userResultMap">
		select *
		from USER_TEST_TB_RELATIONSHIP
	</select>

</mapper>
{% endhighlight %}

UserMapper.java
---------------------

Mapper类`src/main/java/com.freud.practice`目录下

{% highlight java %}
package com.freud.practice;

import java.util.List;

public interface UserMapper
{
	public List<User> getUser();
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
