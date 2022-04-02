---
layout: post
title:  Javascript foreach问题记录
date:   2015-07-03 11:13:00 +0800
categories: 技术文档
tag: javascript
---

* content
{:toc}


javascript的`for in`在使用的过程中，ie 11下和firefox,Chrome下，其中`for(var item in data)`的item值是不一样的，导致相同的代码在各个浏览器下兼容性不好。最后的解决方案是使用原生的for循环解决。

{% highlight javascript %}
for (var i=0;i<cars.length;i++)
{
document.write(cars[i] + "<br>");
}
{% endhighlight %}

参考资料
===========================

js中for in 和 for each in的用法和区别 [http://blog.sina.com.cn/s/blog_855dfd9e0101a2w0.html](http://blog.sina.com.cn/s/blog_855dfd9e0101a2w0.html)

for in 遍历的兼容性问题探讨 [http://blog.sina.com.cn/s/blog_855dfd9e0101a2xm.html](http://blog.sina.com.cn/s/blog_855dfd9e0101a2xm.html)

JavaScript For 循环[http://www.w3school.com.cn/js/js_loop_for.asp](http://www.w3school.com.cn/js/js_loop_for.asp)