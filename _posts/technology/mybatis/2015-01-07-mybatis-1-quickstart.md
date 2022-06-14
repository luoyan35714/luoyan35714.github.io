---
layout: post
title:  mybatis-系列教程(一)-入门(quickstart)
date:   2015-01-07 20:39:01 +0800
category : 技术文档
tag : mybatis
---

* content
{:toc}


所需要用到的其他工具或技术
=============================

| 项目管理工具 | Maven |
| 测试运行工具 | Junit |
| 数据库 | Derby |

废话不多说,直接代码

Maven Dependencies
=============================

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
=============================

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
=============================

`src/main/resource`源目录下

test-mybatis-configuration.xml
-----------------------------

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
		<!-- <mapper class="com.freud.practice.UserMapper" /> -->
		<mapper resource="com/freud/practice/UserMapper.xml" />
	</mappers>
</configuration>
{% endhighlight%}

UserMapper.xml  Mapper文件
-----------------------------

`src/main/java/com.freud.practice`目录下

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.freud.practice.UserMapper">
	<select id="getUser" resultType="com.freud.practice.User">
		select *
		from USER_TEST_TB
	</select>
</mapper>
{% endhighlight%}

User.java对象类
-----------------------------

`src/main/java/com.freud.practice`目录下

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

UserMapper.java Mapper类
-----------------------------

`src/main/java/com.freud.practice`目录下

{% highlight java %}
package com.freud.practice;

import java.util.List;
import org.apache.ibatis.annotations.Select;

public interface UserMapper
{
	//@Select("SELECT * FROM USER_TEST_TB")
	public List<User> getUser();
}
{% endhighlight%}

测试类TestMyBatis.java
-----------------------------

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
		source = "test-mybatis-configuration.xml";
	}

	@Test
	public void testXMLConfingureSessionFactory()
	{
		try
		{
			inputStream = TestMyBatis.class.getClassLoader().getResourceAsStream(source);
			sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
			SqlSession session = sqlSessionFactory.openSession();

			List<User> users = (List) session.selectList("com.freud.practice.UserMapper.getUser");
			System.out.println("Query by XML configuration...");
			this.printUsers(users);

			UserMapper userMapper = session.getMapper(UserMapper.class);
			System.out.println("\r\nQuery by annotation configuration...");
			this.printUsers(userMapper.getUser());

		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

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

以上是使用XML作为Mapper配置文件的一个入门，其实Mybatis还支持Annotation的方式，具体操作如下：

* 打开UserMapper.java中的注释。

* 打开test-mybatis-configuration.xml中的注释，并注释掉现有的Mapper

* 删除UserMapper.xml文件

这种是Mybatis的Annotation方式的Mapper配置。个人比较偏向于XML方式，所以后续的教程会更倾向于XML配置的方式来写。

OK了，这就是今天要写得。

<br/>
<br/>