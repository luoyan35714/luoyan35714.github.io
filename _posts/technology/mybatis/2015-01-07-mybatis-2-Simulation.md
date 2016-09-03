---
layout: post
title:  mybatis-系列教程(二)-模拟实现基于XML和Annotation的小型Mybatis(Simulation)
date:   2015-01-07 20:57:01 +0800
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
| XML操作工具 | Dom4j |

继续不废话

Maven Dependencies
=============================

{% highlight xml %}
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

<dependency>
	<groupId>dom4j</groupId>
	<artifactId>dom4j</artifactId>
	<version>1.6.1</version>
</dependency>
{% endhighlight%}

SQL 建表及数据插入（如果在第一节中作过，可以跳过此步）
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
{% endhighlight%}

Mybatis配置文件
=============================

`src/main/resource`源目录下

test-mybatis-configuration.xml
-----------------------------

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>
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
		<mapper class="com.freud.practice.annotation.UserMapper" />
		<mapper resource="com/freud/practice/xml/UserMapper.xml" />
	</mappers>
</configuration>
{% endhighlight%}

User.java对象类
-----------------------------

`src/main/java/com/freud/practice`目录下

{% highlight java %}
package com.freud.practice;

/**
 * 
 * User Model
 * 
 */
public class User
{

	private String id;

	private String username;

	private String password;

	private String nickname;

	public String getId()
	{
		return id;
	}

	public void setId(String id)
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

Select.java 注解类
-----------------------------

`src/main/java/com/freud/practice/annotation`目录下

{% highlight java %}
package com.freud.practice.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** 标注此注解只能用在方法上 */
@Target(ElementType.METHOD)
/** 标注此注解生命周期是在Runtime运行时 */
@Retention(RetentionPolicy.RUNTIME)
public @interface Select
{
	String value();
}
{% endhighlight%}

UserMapper.java
-----------------------------

基于Annotation的配置类`src/main/java/com/freud/practice/annotation`目录下

{% highlight java %}
package com.freud.practice.annotation;

import com.freud.practice.User;

import java.util.List;

public interface UserMapper
{

	@Select("select * from USER_TEST_TB")
	public List<User> getUser();
}
{% endhighlight%}

Mapper.java 对象类
-----------------------------

`src/main/java/com/freud/practice/simulation`目录下

{% highlight java %}
package com.freud.practice.simulation;

/**
 * 
 * 存储查询结果对象
 *
 */
public class Mapper
{
	/**
	 * 返回类型
	 */
	private String resultType;

	/**
	 * 查询ＳＱＬ
	 */
	private String querySql;

	public String getResultType()
	{
		return resultType;
	}

	public void setResultType(String resultType)
	{
		this.resultType = resultType;
	}

	public String getQuerySql()
	{
		return querySql;
	}

	public void setQuerySql(String querySql)
	{
		this.querySql = querySql;
	}

}
{% endhighlight%}

SQLSelectProxy.java AOP动态代理类
-----------------------------

`src/main/java/com/freud/practice/simulation`目录下

{% highlight java %}
package com.freud.practice.simulation;

import com.freud.practice.annotation.Select;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.List;

public class SQLSelectProxy implements InvocationHandler
{

	@Override
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable
	{
		/**
		 * 获得Mapper方法上的Select注解,以此来取得注解中的SQL语句
		 */
		Select select = method.getAnnotation(Select.class);

		if (!method.isAnnotationPresent(Select.class))
		{
			throw new RuntimeException("缺少@Select注解!");
		}

		PreparedStatement pstmt = null;
		ResultSet rs = null;
		Object obj = null;

		try
		{
			pstmt = SqlSessionImpl.connection.prepareStatement(select.value());
			rs = pstmt.executeQuery();

			/**
			 * 获得Method的返回对象类型,此处应当作判断处理,当List的时候,当只返回一个对象的时候. 
			 * 为了简单实现功能并与第一节中测试文件不发生冲突起见,此处当作List处理
			 */
			String returnType = method.getGenericReturnType().toString();//java.util.List<com.freud.practice.User>

			if (returnType.startsWith(List.class.getName()))
			{
				//去掉我们不需要的字符串，得到List中的类型
				returnType = returnType.replace(List.class.getName(), "").replace("<", "").replace(">", "");
			}
			else
			{
				// 返回其他对象应当作其他处理，此处为了简单起见，暂不处理
			}
			obj = SqlSessionImpl.executeQuery(rs, returnType);

		}
		finally
		{
			if (rs != null && !rs.isClosed())
			{
				rs.close();
			}
			if (pstmt != null && !pstmt.isClosed())
			{
				pstmt.close();
			}

		}
		return obj;
	}
}
{% endhighlight%}

SqlSession.java Mybatis模拟接口
-----------------------------

`src/main/java/com/freud/practice/simulation`目录下

{% highlight java %}
package com.freud.practice.simulation;

import java.util.List;

/**
 * 
 * 模拟SqlSession
 * 
 */
public interface SqlSession
{

	public <T> T getMapper(Class<T> clazz);

	public <E> List<E> selectList(String query) throws Exception;

}
{% endhighlight%}

SqlSessionFactory.java Mybatis模拟类
-----------------------------

`src/main/java/com/freud/practice/simulation`目录下

{% highlight java %}
package com.freud.practice.simulation;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

/**
 * 
 * 模拟SqlSessionFactory
 * 
 */
public class SqlSessionFactory
{

	private InputStream configuration;

	public SqlSession openSession() throws IOException
	{
		SqlSessionImpl session = new SqlSessionImpl();
		loadConfigurations(session);
		return session;
	}

	/**
	 * 
	 * 通过Ｄｏｍ４ｊ读取配置文件信息
	 * 
	 * @param session
	 * @throws IOException
	 */
	private void loadConfigurations(final SqlSessionImpl session) throws IOException
	{
		try
		{
			Document document = new SAXReader().read(configuration);
			Element root = document.getRootElement();

			List<Element> mappers = root.element("mappers").elements("mapper");
			for (Element mapper : mappers)
			{
				if (mapper.attribute("resource") != null)
				{
					session.setXmlSQLs(loadXMLConfiguration(mapper.attribute("resource").getText()));
				}

				if (mapper.attribute("class") != null)
				{

				}
			}
		}
		catch (Exception e)
		{
			System.out.println("读取配置文件错误!");
		}
		finally
		{
			configuration.close();
		}
	}

	/**
	 * 
	 * 通过ｄｏｍ４ｊ读取Ｍａｐｐｅｒ．ｘｍｌ中的信息
	 * 
	 * @param resource
	 * @return
	 * @throws DocumentException
	 * @throws IOException
	 */
	private Map<String, Mapper> loadXMLConfiguration(String resource) throws DocumentException, IOException
	{
		Map<String, Mapper> map = new HashMap<String, Mapper>();
		InputStream is = null;
		try
		{
			is = this.getClass().getClassLoader().getResourceAsStream(resource);

			Document document = new SAXReader().read(is);
			Element root = document.getRootElement();
			if (root.getName().equalsIgnoreCase("mapper"))
			{

				String namespace = root.attribute("namespace").getText();

				for (Element select : (List<Element>) root.elements("select"))
				{
					Mapper mapperModel = new Mapper();
					mapperModel.setResultType(select.attribute("resultType").getText());
					mapperModel.setQuerySql(select.getText().trim());

					map.put(namespace + "." + select.attribute("id").getText(), mapperModel);
				}
			}
		}
		finally
		{
			is.close();
		}
		return map;
	}

	public InputStream getConfiguration()
	{
		return configuration;
	}

	public void setConfiguration(InputStream configuration)
	{
		this.configuration = configuration;
	}
}
{% endhighlight%}

SqlSessionFactoryBuilder.java Mybatis模拟类
-----------------------------

`src/main/java/com/freud/practice/simulation`目录下

{% highlight java %}
package com.freud.practice.simulation;

import java.io.InputStream;

/**
 * 
 * 模拟SqlSessionFactoryBuilder
 * 
 */
public class SqlSessionFactoryBuilder
{

	public SqlSessionFactory build(InputStream is)
	{
		SqlSessionFactory sessionFactory = new SqlSessionFactory();
		sessionFactory.setConfiguration(is);
		return sessionFactory;
	}

}
{% endhighlight%}

SqlSessionImpl.java Mybatis模拟类
-----------------------------

`src/main/java/com/freud/practice/simulation`目录下

{% highlight java %}
package com.freud.practice.simulation;

import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 
 * 模拟SqlSessionImpl
 * 
 */
public class SqlSessionImpl implements SqlSession
{

	/** DB connection */
	public static Connection connection;

	private Map<String, Mapper> xmlSQLs;

	private List<String> annotationClasses;

	public SqlSessionImpl()
	{
		/**
		 * driverString 和 connString 应该是从配置文件读取，这里简化了
		 */
		final String driverString = "org.apache.derby.jdbc.ClientDriver";
		final String connString = "jdbc:derby://localhost:1527/freud;create=true";
		try
		{
			Class.forName(driverString);
			/** 获得DB连接 */
			connection = DriverManager.getConnection(connString);
		}
		catch (Exception e)
		{
			System.out.println("获取DBConnection出错！");
		}
	}

	/**
	 * 基于Annotation的数据库操作
	 * 
	 */
	@Override
	public <T> T getMapper(Class<T> clazz)
	{
		T clazzImpl =
		        (T) Proxy.newProxyInstance(this.getClass().getClassLoader(), new Class[] {clazz}, new SQLSelectProxy());

		return clazzImpl;
	}

	/**
	 * 
	 * 基于XML的查询操作
	 */
	@Override
	public <E> List<E> selectList(String query) throws Exception
	{
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		try
		{
			/** 简单的PreparedStateme JDBC实现 */
			pstmt = connection.prepareStatement(xmlSQLs.get(query).getQuerySql());
			rs = pstmt.executeQuery();
			/** 执行查询操作 */
			return executeQuery(rs, xmlSQLs.get(query).getResultType());
		}
		finally
		{
			if (!rs.isClosed())
			{
				rs.close();
			}

			if (!pstmt.isClosed())
			{
				pstmt.close();
			}
		}
	}

	/**
	 * 
	 * 执行查询操作，并将查询到的结果与配置中的ResultType根据变量名一一对应，通过反射调用Set方法注入各个变量的值
	 * 
	 * @param rs
	 * @param type
	 * @return
	 * @throws Exception
	 */
	public static <E> List<E> executeQuery(ResultSet rs, String type) throws Exception
	{
		int count = rs.getMetaData().getColumnCount();

		List<String> columnNames = new ArrayList<String>();

		for (int i = 1; i <= count; i++)
		{
			columnNames.add(rs.getMetaData().getColumnName(i));
		}

		final List list = new ArrayList<Object>();

		while (rs.next())
		{
			Class modelClazz = Class.forName(type);
			Object obj = modelClazz.newInstance();
			for (Method setMethods : modelClazz.getMethods())
			{
				for (String columnName : columnNames)
				{
					if (setMethods.getName().equalsIgnoreCase("set" + columnName))
					{
						setMethods.invoke(obj, rs.getString(columnName));
					}
				}
			}
			list.add(obj);
		}

		return list;
	}

	public Map<String, Mapper> getXmlSQLs()
	{
		return xmlSQLs;
	}

	public void setXmlSQLs(Map<String, Mapper> xmlSQLs)
	{
		this.xmlSQLs = xmlSQLs;
	}

	public List<String> getAnnotationClasses()
	{
		return annotationClasses;
	}

	public void setAnnotationClasses(List<String> annotationClasses)
	{
		this.annotationClasses = annotationClasses;
	}
}
{% endhighlight%}

UserMapper.xml 基于XML的Mapper配置文件
-----------------------------

`src/main/java/com/freud/practice/xml`目录下

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>
  <!-- namespace 当基于XML进行配置的时候是根据namespace+id来拼接进行SQL操作 -->
<mapper namespace="com.freud.practice.UserMapper">
	<!-- select 查询 -->
	<select id="getUser" resultType="com.freud.practice.User">
		select *
		from USER_TEST_TB
	</select>
</mapper>
{% endhighlight%}

TestMyBatis.java 测试类
-----------------------------

`src/test/java/com/freud/practice`目录下

{% highlight java %}
package com.freud.practice;

import com.freud.practice.annotation.UserMapper;
import com.freud.practice.simulation.SqlSession;
import com.freud.practice.simulation.SqlSessionFactory;
import com.freud.practice.simulation.SqlSessionFactoryBuilder;
import com.freud.practice.simulation.SqlSessionImpl;

import java.io.InputStream;
import java.sql.SQLException;
import java.text.MessageFormat;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class TestMyBatis
{

	/** 配置置文件 */
	private String source;

	private InputStream inputStream;

	private SqlSessionFactory sqlSessionFactory;

	@Before
	public void setUp()
	{
		source = "test-mybatis-configuration.xml";
	}

	/**
	 * 
	 * 基于XML格式配置的测试方法
	 * 
	 */
	@Test
	public void testXMLConfingure()
	{

		try
		{
			/**
			 * 获得Session
			 */
			inputStream = TestMyBatis.class.getClassLoader().getResourceAsStream(source);
			sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
			SqlSession session = sqlSessionFactory.openSession();

			/**
			 * 执行Ｑｕｅｒｙ操作
			 */
			List<User> users = (List) session.selectList("com.freud.practice.UserMapper.getUser");
			System.out.println("Query by XML configuration...");

			/**
			 * 打印结果
			 */
			this.printUsers(users);

		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

	/**
	 * 
	 * 基于Annotation配置的测试方法
	 * 
	 */
	@Test
	public void testAnnotationConfingure()
	{
		try
		{
			inputStream = TestMyBatis.class.getClassLoader().getResourceAsStream(source);
			sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
			SqlSession session = sqlSessionFactory.openSession();

			UserMapper userMapper = session.getMapper(UserMapper.class);
			System.out.println("\r\nQuery by annotation configuration...");
			this.printUsers(userMapper.getUser());

		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

	@After
	public void clearUp() throws SQLException
	{
		if (SqlSessionImpl.connection != null && !SqlSessionImpl.connection.isClosed())
		{
			SqlSessionImpl.connection.close();
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

以上就是基于XML以及Annotation的方式对Mybatis实现了一个简单的模拟。旨在理解Mybatis的工作原理。
笔者一直觉得当学习一个工具类技术的时候，路线应该是

* 实现一个小例子

* 找材料理解其中原理

* 学习技术细节，并动手全部实现

* 在全部学完之后动手做一个小项目，尽可能的使用这个在技术中的各个环节。


这种方法对笔者来说屡试不爽。
现在我们已经走完了前两步，接下来就是学习技术细节了。

<br/>
<br/>