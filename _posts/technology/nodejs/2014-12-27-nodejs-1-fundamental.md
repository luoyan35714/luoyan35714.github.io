---
layout: post
title:  Node.js-学习笔记(一)-入门
date:   2014-12-27 13:03:01 +0800
category : 技术文档
tag : node.js
---
 
 * content
{:toc}


Node.Js是什么
==============================

简单的说 Node.js 就是运行在服务端的 JavaScript。

Node.js 是一个基于Chrome JavaScript 运行时建立的一个平台。

Node.js是一个事件驱动I/O服务端JavaScript环境，基于Google的V8引擎，V8引擎执行Javascript的速度非常快，性能非常好

`单进程、单线程模式运行`（和Javascript的运行方式一致），事件驱动机制是Node.js通过内部单线程高效率地维护事件循环队列来实现的，没有多线程的资源占用和上下文切换，这意味着面对大规模的http请求，Node.js凭借事件驱动搞定一切，由此我们可以推测出这样的设计会导致负载的压力集中在CPU（事件循环处理？）而不是内存（还记得Java虚拟机抛出OutOfMemory异常的日子吗？）

安装
==============================

支持Windows，Linux，Unix等平台的安装

centOS下安装nodejs
------------------------------

* 下载源码，你需要在http://nodejs.org/下载最新的Nodejs版本，本文以v0.10.24为例:

* {% highlight c%}
cd /usr/local/src/
wget http://nodejs.org/dist/v0.10.24/node-v0.10.24.tar.gz
{% endhighlight %}

* 解压源码

* {% highlight c%}
tar zxvf node-v0.10.24.tar.gz
{% endhighlight %}

* 编译安装

* {% highlight c%}
cd node-v0.10.24 
./configure --prefix=/usr/local/node/0.10.24 
make 
make install
{% endhighlight %}

* 配置NODE_HOME，进入profile编辑环境变量

* {% highlight c%}
vim /etc/profile
{% endhighlight %}

* 设置nodejs环境变量

* {% highlight bash %}
#set for nodejs 
export NODE_HOME=/usr/local/node/0.10.24
export PATH=$NODE_HOME/bin:$PATH
{% endhighlight %}

* :wq保存并退出，编译/etc/profile 使配置生效

* {% highlight c%}
source /etc/profile
{% endhighlight %}

* 验证是否安装配置成功

* {% highlight c%}
node -v
{% endhighlight %}

* 输出 `v0.10.24` 表示配置成功
* npm模块安装路径

* {% highlight c%}
/usr/local/node/0.10.24/lib/node_modules/
{% endhighlight %}

NPM
==============================
Node.js包管理工具。类似于Linux中的Yum和rpm，Ruby中的Gem

官网：
[https://www.npmjs.org/](https://www.npmjs.org/)

命令介绍：
[https://www.npmjs.org/doc/misc/npm-index.html](https://www.npmjs.org/doc/misc/npm-index.html)

HelloWorld
------------------------------

源代码

{% highlight js %}
//helloworld.js
console.log(‘HelloWorld’);
{% endhighlight %}

在Terminal下运行

{% highlight c %}
node helloworld.js
{% endhighlight %}

创建HTTP服务器
==============================

{% highlight js %}
var http = require('http');
http.createServer(function (request, response) {
   response.writeHead(200, {'Content-Type': 'text/plain'});
   response.end('Hello World\n');
}).listen(8888);

console.log('Server running at http://127.0.0.1:8888/');
{% endhighlight %}

模块
==============================

模块是什么
------------------------------

{% highlight js %}
//hello.js
function Hello() {
	var name;
	this.setName = function(thyName) {
		name = thyName;
	};

	this.sayHello = function() {
		console.log('Hello ' + name);  	
	};  
};

module.exports = Hello;
{% endhighlight %}

模块的加载策略
------------------------------

* Node.js的模块分为两类，一类为原生（核心）模块，一类为文件模块。原生模块在Node.js源代码编译的时候编译进了二进制执行文件，加载的速度最快。另一类文件模块是动态加载的，加载速度比原生模块慢。但是Node.js对原生模块和文件模块都进行了缓存，于是在第二次require时，是不会有重复开销的。其中原生模块都被定义在lib这个目录下面，文件模块则不定性。

* require方法接受以下几种参数的传递：
	+ http、fs、path等，原生模块。
	+ ./mod或../mod，相对路径的文件模块。
	+ /pathtomodule/mod，绝对路径的文件模块。
	+ mod，非原生模块的文件模块。
![Exports the modules](/images/blog/nodejs/1_fundamental/1_module_exports.png)

ModulePath
------------------------------

{% highlight js %}
console.log(module.paths);
{% endhighlight %}

{% highlight c %}
[ '/root/install-files/nodejs/practice/12-monitor/repl/node_modules',
  '/root/install-files/nodejs/practice/12-monitor/node_modules',
  '/root/install-files/nodejs/practice/node_modules',
  '/root/install-files/nodejs/node_modules',
  '/root/install-files/node_modules',
  '/root/node_modules',
  '/node_modules' ]
{% endhighlight %}

除此之外，还有一个全局的mudulepath在lib/node目录下

NodeJs编译之后，会对模块进行封装
------------------------------

{% highlight js %}
(function (exports, require, module, __filename, __dirname) {
	var circle = require('./test.js');
	console.log('The area of a circle of radius 4 is ' + circle.area(4));
});
{% endhighlight %}

事件机制
==============================

是什么
------------------------------

Node.js中大部分的模块，都继承自Event模块。Event模块（events.EventEmitter）是一个简单的事件监听器模式的实现。

{% highlight js %}
//event.js
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();

event.on('some_event', function() {
	console.log('some_event occured.');
});

setTimeout(function() {
	event.emit('some_event');
}, 1000);
{% endhighlight %}

EventEmitter
------------------------------

events 模块只提供了一个对象： events.EventEmitter。EventEmitter的核心就 是事件发射与事件监听器功能的封装。EventEmitter具有on，once，addListener，removeListener，removeAllListeners，emit等基本的事件监听模式的方法实现。

EventEmitter 的每个事件由一个事件名和若干个参 数组成，事件名是一个字符串，通常表达一定的语义。对于每个事件，EventEmitter 支持 若干个事件监听器。

当事件发射时，注册到这个事件的事件监听器被依次调用，事件参数作 为回调函数参数传递。

让我们以下面的例子解释这个过程：

{% highlight js %}
var events = require('events');
var emitter = new events.EventEmitter();
emitter.on('someEvent', function(arg1, arg2) {
	console.log('listener1', arg1, arg2);
});

emitter.on('someEvent', function(arg1, arg2) {
	console.log('listener2', arg1, arg2);
});

emitter.emit('someEvent', 'Hi-Freud', 2014);
{% endhighlight %}

Error事件
------------------------------

为了提升Node.js的程序的健壮性，EventEmitter对象对error事件进行了特殊对待。如果运行期间的错误触发了error事件。EventEmitter会检查是否有对error事件添加过侦听器，如果添加了，这个错误将会交由该侦听器处理，否则，这个错误将会作为异常抛出。如果外部没有捕获这个异常，将会引起线程的退出。

{% highlight js %}

var events = require('events');
var emitter = newevents.EventEmitter();
emitter.emit('error'); 

{% endhighlight %}

Node.js 全局对象
==============================

在Node.js 中能够直接访问到对象通常都是 global 的属性

process
------------------------------

* process.stdout是标准输出流，通常我们使用的 console.log() 向标准输出打印 字符，而 process.stdout.write() 函数提供了更底层的接口。
* process.stdin是标准输入流，初始时它是被暂停的，要想从标准输入读取数据， 你必须恢复流，并手动编写流的事件响应函数。
* process.nextTick(callback)的功能是为事件循环设置一项任务，Node.js 会在 下次事件循环调响应时调用 callback。Node.js 适合I/O 密集型的应用，而不是计算密集型的应用， 因为一个Node.js 进程只有一个线程，因此在任何时刻都只有一个事件在执行。如果这个事 件占用大量的CPU 时间，执行事件循环中的下一个事件就需要等待很久，因此Node.js 的一 个编程原则就是尽量缩短每个事件的执行时间。process.nextTick() 提供了一个这样的 工具，可以把复杂的工作拆散，变成一个个较小的事件。

{% highlight js %}

functiondoSomething(args) {
	somethingComplicated_1(args);
	process.nextTick(somethingComplicated_2());
} 

{% endhighlight %}

console
------------------------------

* Console.log(‘aaa’); 接受若干个参数，如果只有一个参数，则输出这个参数的字符串形式。如果有多个参数，则 以类似于C 语言 printf() 命令的格式输出。
* Console.error(); 与console.log() 用法相同，只是向标准错误流输出。
* Console.trace(); 向标准错误流输出当前的调用栈。

常用工具Util
==============================

* util.inherits(constructor, superConstructor)：是一个实现对象间原型继承 的函数。
* util.inspect(object,[showHidden],[depth],[colors])：是一个将任意对象转换 为字符串的方法，通常用于调试和错误输出。它至少接受一个参数 object，即要转换的对象。
	- showHidden 是一个可选参数，如果值为 true，将会输出更多隐藏信息。
	- depth 表示最大递归的层数，如果对象很复杂，你可以指定层数以控制输出信息的多 少。如果不指定depth，默认会递归2层，指定为 null 表示将不限递归层数完整遍历对象。
	- 如果color 值为 true，输出格式将会以ANSI 颜色编码，通常用于在终端显示更漂亮的效果。
	- 特别要指出的是，util.inspect 并不会简单地直接把对象转换为字符串，即使该对 象定义了toString 方法也不会调用。
* util.isArray(object)：如果给定的参数 "object" 是一个数组返回true，否则返回false。
* util.isRegExp(object)： 如果给定的参数 "object" 是一个正则表达式返回true，否则返回false。
* util.isDate(object)：如果给定的参数 "object" 是一个日期返回true，否则返回false。
* util.isError(object)：如果给定的参数 "object" 是一个错误对象返回true，否则返回false。

Node.js 文件系统
==============================

* fs.readFile(filename,[encoding],[callback(err,data)])
	- filename（必选），表示要读取的文件名。
	- encoding（可选），表示文件的字符编码。
	- callback 是回调函数，用于接收文件的内容。

* fs.readFileSync(filename, [encoding])
	- 是 fs.readFile 同步的版本。它接受 的参数和 fs.readFile 相同，而读取到的文件内容会以函数返回值的形式返回。如果有错 误发生，fs 将会抛出异常，你需要使用 try 和 catch 捕捉并处理异常。

* fs.open(path, flags, [mode], [callback(err, fd)])是POSIX open 函数的 封装，与C 语言标准库中的 fopen 函数类似。它接受两个必选参数，path 为文件的路径， flags 可以是以下值。
	- r ：以读取模式打开文件。
	- r+ ：以读写模式打开文件。
	- w ：以写入模式打开文件，如果文件不存在则创建。
	- w+ ：以读写模式打开文件，如果文件不存在则创建。
	- a ：以追加模式打开文件，如果文件不存在则创建。
	- a+ ：以读取追加模式打开文件，如果文件不存在则创建

* fs.read(fd, buffer, offset, length, position, [callback(err, bytesRead, buffer)])
	- fd: 读取数据并写入 buffer 指向的缓冲区对象。
	- offset: 是buffer 的写入偏移量。
	- length: 是要从文件中读取的字节数。
	- position: 是文件读取的起始位置，如果 position 的值为 null，则会从当前文件指针的位置读取。
	- callback:回调函数传递bytesRead 和 buffer，分别表示读取的字节数和缓冲区对象。

Nodejs设置代理
------------------------------

npm获取配置有6种方式，优先级由高到底。

* 命令行参数。 --proxy http://server:port即将proxy的值设为http://server:port。
* 环境变量。 以npm_config_为前缀的环境变量将会被认为是npm的配置属性。如设置proxy可以加入这样的环境变量npm_config_proxy=http://server:port。
* 用户配置文件。可以通过npm config get userconfig查看文件路径。如果是mac系统的话默认路径就是$HOME/.npmrc。
* 全局配置文件。可以通过npm config get globalconfig查看文件路径。mac系统的默认路径是/usr/local/etc/npmrc。
* 内置配置文件。安装npm的目录下的npmrc文件。
* 默认配置。 npm本身有默认配置参数，如果以上5条都没设置，则npm会使用默认配置参数。

为npm设置代理

{% highlight c%}
$ npm config set proxy http://server:port
$ npm config set https-proxy http://server:port
{% endhighlight %}

如果代理需要认证的话可以这样来设置。

{% highlight c%}
$ npm config set proxy http://username:password@server:port
$ npm config set https-proxy http://username:pawword@server:port
{% endhighlight %}

如果代理不支持https的话需要修改npm存放package的网站地址。

{% highlight c%}
$ npm config set registry "http://registry.npmjs.org/"
{% endhighlight %}

<br>
<br>

参考资料
==============================

W3cschool: [http://www.w3cschool.cc/nodejs/nodejs-tutorial.html](http://www.w3cschool.cc/nodejs/nodejs-tutorial.html)

InfoQ: [http://www.infoq.com/cn/articles/what-is-nodejs](http://www.infoq.com/cn/articles/what-is-nodejs)

NodeJs官网：[http://nodejs.org/](http://nodejs.org/)

ByVoid: 《node.js开发指南》

田永强：《深入浅出nodejs》