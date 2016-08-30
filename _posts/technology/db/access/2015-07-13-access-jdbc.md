---
layout: post
title:  Java操作Access数据库
date:   2015-07-13 14:32:00 +0800
categories: 技术文档
tag: db
---

* content
{:toc}


关于Access数据库
-------------------------------------

Microsoft Office Access是由微软发布的关系数据库管理系统。它结合了MicrosoftJet Database Engine和图形用户界面两项特点，是Microsoft Office的系统程序之一。

关于java操作Access数据库
-------------------------------------

- 在JDK 1.7及以前，内置了Access的数据库驱动`sun.jdbc.odbc.JdbcOdbcDriver`,但是从JDK1.8开始Oracle去掉了这部分内容,参考Oracle官方文档[http://docs.oracle.com/javase/7/docs/technotes/guides/jdbc/bridge.html](http://docs.oracle.com/javase/7/docs/technotes/guides/jdbc/bridge.html)

当前主流的java操作Access数据库方式
-------------------------------------

- ucanaccess[http://sourceforge.net/projects/ucanaccess/](http://sourceforge.net/projects/ucanaccess/)

{% highlight java %}
package com.freud.access;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Access 数据库测试类
 * 
 * @author Freud
 *
 */
public class TestAccess {

	public static void main(String args[]) throws Exception {
		Class.forName("net.ucanaccess.jdbc.UcanaccessDriver");
		String dbur1 = "jdbc:ucanaccess://TEST_ACCESS.accdb";// 此为JDBC连接方式

		// 获取连接
		Connection conn = DriverManager.getConnection(dbur1);

		Statement stmt = conn.createStatement();
		// 执行查询
		ResultSet rs = stmt.executeQuery("select * from t_table");

		while (rs.next()) {
			System.out.println(rs.getString(2));
		}
		rs.close();
		stmt.close();
		conn.close();
	}

}
{% endhighlight %}

需要的jar包

{% highlight text %}
commons-lang-2.6.jar
commons-logging-1.1.1.jar
hsqldb.jar
jackcess-2.1.0.jar
ucanaccess-2.0.9.5.jar
{% endhighlight %}

可以从[http://sourceforge.net/projects/ucanaccess/files/latest/download](http://sourceforge.net/projects/ucanaccess/files/latest/download)下载得到。

测试用Access文件[TEST_ACCESS.accdb](/resources/access/TEST_ACCESS.accdb)

- ACCESS_JDBC30.jar[http://www.hxtt.com/access.html](http://www.hxtt.com/access.html)

有点遗憾的是这款驱动是收费的。