---
layout: post
title:  mybatis-系列教程(九)-常用知识点记录
date:   2016-05-04 16:48:01 +0800
category : 技术文档
tag : mybatis
---

* content
{:toc}


foreach
===========================

{% highlight xml %}
<foreach item="item" collection="listItems" separator="," open="(" close=")" >  
    #{item}
</foreach>
{% endhighlight %}

if
===========================

{% highlight xml %}
<if test="item!=null">
    and item = #{item}
</if>
{% endhighlight %}

LIKE
===========================

{% highlight xml %}
    ITEM LIKE ('%',${item},'%') 
{% endhighlight %}

注：
===========================

+ 在Mybatis中#将传入的数据都当成一个字符串，会对自动传入的数据加一个双引号。如：order by #user_id#，如果传入的值是111,那么解析成sql时的值为order by "111", 如果传入的值是id，则解析成的sql为order by "id".
+ `$`将传入的数据直接显示生成在sql中。如：order by $user_id$，如果传入的值是111,那么解析成sql时的值为order by user_id,  如果传入的值是id，则解析成的sql为order by id.
+ `#`方式能够很大程度防止sql注入。
+ `$`方式无法防止Sql注入。
+ `$`方式一般用于传入数据库对象，例如传入表名. 
+ 一般能用#的就别用$. 
+ 在使用mybatis中还遇到<![CDATA[]]>的用法，在该符号内的语句，将不会被当成字符串来处理，而是直接当成sql语句，比如要执行一个存储过程。

参考资料
===========================

mybatis 中#与$的区别 : [mybatis 中#与$的区别](http://blog.csdn.net/downkang/article/details/12499197/)

<br />
<br />