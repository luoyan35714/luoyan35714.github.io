---
layout: post
title:  fastdb-学习笔记(十三)-在不同DB之间共享Class
date:   2014-12-24 13:24:01 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


从2.18版本开始，FastDB支持在不通DataBases之间共享Classes，要使用此功能，需要：

* 通过`REGISTER_UNASSIGNED`宏定义来注册Classes
* 在dbCursor的构造器中作为以一个Parameter指定指向dbDataBase的路径
* insert方法现在属于dbDataBase类（如果C++编译器不支持成员模版，那就需要定义NO_MEMBER_TEMPLATES宏并且把指向database的路径作为第一个参数）

例如:

{% highlight c++ %}
class MyClass {
    ...
};
REGISTER_UNASSIGNED(MyClass);
dbDatabase* db;
dbCursor<MyClass> cursor(db);
MyClass rec;
if (cursor.select(q) == 0) {
    db->insert(rec);
}
{% endhighlight %}

<br>
<br>

参考资料
=================================

fastdb主页 : [http://www.garret.ru/fastdb.html](http://www.garret.ru/fastdb.html)

FastDB SourceForge主页 : [http://sourceforge.net/projects/fastdb](http://sourceforge.net/projects/fastdb)

FastDB SourceForge下载 :

[http://sourceforge.net/projects/fastdb/files/latest/download](http://sourceforge.net/projects/fastdb/files/latest/download)

参考博客 ：

[http://blog.csdn.net/fuyun10036/article/details/8620542](http://blog.csdn.net/fuyun10036/article/details/8620542)