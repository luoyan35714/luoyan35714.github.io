---
layout: post
title:  fastdb-学习笔记(三)-Java中简单编码实现
date:   2014-12-23 17:05:01 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


* 创建一个新的对象类，并在内部添加一个以static final修饰的String类型变量`CONSTRAINTS`

{% highlight java %}
/**
 * Record 表类
 * 
 * @author Freud
 * 
 */
class Record {

	private int id;
	private String content;

	/** 约束条件 */
	static final String CONSTRAINTS = "id using index, content using index";

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

}
{% endhighlight %}

* 插入操作

{% highlight java %}
/**
 * 写入数据库
 * 
 * @param db
 */
public static void write(Database db) {
	/** 遍历nRecords条记录　 */
	for (int i = 0; i < nRecords; i++) {
		/** 创建一个新的Record记录　 */
		Record rec = new Record();
		rec.setId(i);
		rec.setContent("strkey--" + i);

		/** 插入并返回Object Id */
		long oid = db.insert(rec);
		map.put(i, oid);
	}
	db.commit();
}
{% endhighlight %}

* 查询操作

{% highlight java %}
/**
 * 通过ID读取数据
 * 
 * @param db
 */
public static void queryById(Database db) {

	Query: for (int i = 0; i < nRecords; i++) {

		/** 查询得到游标　 */
		Cursor cursor = db.select(Record.class, "id=" + i, 0);

		/** 如果游标的size大于1,即存在重复数据，表示程序上次操作退出时未删除　 */
		if (cursor.size() > 1) {
			throw new Error(
					"you have inserted multiple object without delete.");
		}

		if (cursor.size() < 1) {
			continue Query;
		}

		/** 得到查询到的记录　 */
		Record rec = (Record) cursor.nextElement();

		System.out.println(rec.getContent());
	}
}
{% endhighlight %}

* 更新操作

{% highlight java %}
/**
 * 更新
 * 
 * @param db
 */
public static void update(Database db) {

	for (int i = 0; i < nRecords; i++) {
		/** 查询得到游标　 */
		Cursor cursor = db.select(Record.class, "id=" + i, 0);

		/** 如果游标的size大于1,即存在重复数据，表示程序上次操作退出时未删除　 */
		if (cursor.size() > 1) {
			throw new Error(
					"you have inserted multiple object without delete.");
		}

		if (cursor.size() < 1) {
			continue;
		}

		/** 得到查询到的记录　 */
		Record rec = (Record) cursor.nextElement();
		rec.setContent("updated--" + i);

		/** 更新操作 */
		db.update(cursor.getOid(), rec);
	}
}
{% endhighlight %}

* 删除操作

{% highlight java %}
/**
 * 删除
 * 
 * @param db
 */
public static void delete(Database db) {

	/** 删除表内所有数据　 */
	db.delete(Record.class, "");
}
{% endhighlight %}

附上全部代码
=================================

{% highlight java %}
package com.freud.fastdb.test;

import java.util.HashMap;
import java.util.Map;

import jnicli.Cursor;
import jnicli.Database;
import jnicli.DatabaseJNI;

/**
 * 测试类
 * 
 * @author Freud
 * 
 */
public class TestBasicSQL {

	/** 记录数量 */
	final static int nRecords = 10000;
	/** 文件初始大小 */
	final static int initSize = 8 * 1024 * 1024; // 40Mb page pool

	static Map<Integer, Long> map = new HashMap<Integer, Long>();

	/**
	 * 写入数据库
	 * 
	 * @param db
	 */
	public static void write(Database db) {
		/** 遍历nRecords条记录　 */
		for (int i = 0; i < nRecords; i++) {
			/** 创建一个新的Record记录　 */
			Record rec = new Record();
			rec.setId(i);
			rec.setContent("strkey--" + i);

			/** 插入并返回Object Id */
			long oid = db.insert(rec);
			map.put(i, oid);
		}
		db.commit();
	}

	/**
	 * 通过ID读取数据
	 * 
	 * @param db
	 */
	public static void queryById(Database db) {

		Query: for (int i = 0; i < nRecords; i++) {

			/** 查询得到游标　 */
			Cursor cursor = db.select(Record.class, "id=" + i, 0);

			/** 如果游标的size大于1,即存在重复数据，表示程序上次操作退出时未删除　 */
			if (cursor.size() > 1) {
				throw new Error(
						"you have inserted multiple object without delete.");
			}

			if (cursor.size() < 1) {
				continue Query;
			}

			/** 得到查询到的记录　 */
			Record rec = (Record) cursor.nextElement();

			System.out.println(rec.getContent());
		}
	}

	/**
	 * 更新
	 * 
	 * @param db
	 */
	public static void update(Database db) {

		for (int i = 0; i < nRecords; i++) {
			/** 查询得到游标　 */
			Cursor cursor = db.select(Record.class, "id=" + i, 0);

			/** 如果游标的size大于1,即存在重复数据，表示程序上次操作退出时未删除　 */
			if (cursor.size() > 1) {
				throw new Error(
						"you have inserted multiple object without delete.");
			}

			if (cursor.size() < 1) {
				continue;
			}

			/** 得到查询到的记录　 */
			Record rec = (Record) cursor.nextElement();
			rec.setContent("updated--" + i);

			/** 更新操作 */
			db.update(cursor.getOid(), rec);
		}
	}

	/**
	 * 删除
	 * 
	 * @param db
	 */
	public static void delete(Database db) {

		/** 删除表内所有数据　 */
		db.delete(Record.class, "");
	}

	public static void main(String[] args) {

		/** 调用c++的JNI接口获得数据库　 */
		Database db = new DatabaseJNI();

		/** 打开数据库　 */
		db.open(Database.READ_WRITE, "BasicSQL", "BasicSQL.dbs", initSize, 0);

		/** 写入　 */
		write(db);

		/** 通过ID读取　 */
		queryById(db);

		/** 更新　 */
		update(db);

		/** 通过ID读取　 */
		queryById(db);

		/** 删除　 */
		delete(db);

		/** 关闭连接 */
		db.close();

		System.out.println("finished");

	}
}

/**
 * Record 表类
 * 
 * @author Freud
 * 
 */
class Record {

	private int id;
	private String content;

	/** 约束条件 */
	static final String CONSTRAINTS = "id using index, content using index";

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

}
{% endhighlight %}

<br>

参考资料
=================================

fastdb主页 : [http://www.garret.ru/fastdb.html](http://www.garret.ru/fastdb.html)

FastDB SourceForge主页 : [http://sourceforge.net/projects/fastdb](http://sourceforge.net/projects/fastdb)

FastDB SourceForge下载 :

[http://sourceforge.net/projects/fastdb/files/latest/download](http://sourceforge.net/projects/fastdb/files/latest/download)
