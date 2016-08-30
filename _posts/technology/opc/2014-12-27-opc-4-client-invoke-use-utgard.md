---
layout: post
title:  OPC-学习笔记(四)-OPC Client Java调用之Utgard
date:   2014-12-27 16:08:01 +0800
category : 技术文档
tag : OPC
---

* content
{:toc}


Utgard是什么
================================

官方网站[http://openscada.org/projects/utgard/](http://openscada.org/projects/utgard/)

utgard是一个开源的项目，基于j-interop做的，用于和OPC SERVER通讯。

j-interop是纯java封装的用于COM/DCOM通讯的开源项目，这样就不必使用JNI

Utgard使用
================================

* 依赖的jar包

| j-interop.jar | 与COM和DCOM通讯的开源项目 |
| j-interopdeps.jar | 	
| jcifs-1.2.19.jar | 
| org.openscada.opc.dcom-1.1.0-20141118.151415-27.jar | Utgard dcom的jar包 |
| org.openscada.opc.lib-1.1.0-20141118.151453-1.jar | Utgard opc的jar包 |
| slf4j-api-1.7.6.jar | Log4j依赖的jar包 |
| log4j-1.2.16.jar | Log4j的jar包 |

Utgard与opc通讯分为两种方式
================================

* Utgard OPC的API
* Utgard DCOM的API

示例代码参见
================================

[OPC_Client_Utgard](https://github.com/luoyan35714/OPC_Client/tree/master/OPC_Client_Utgard)项目

关键API示例
================================

* 列举某Server下的所有OPC连接
{% highlight java %}
ServerList serverList = new ServerList("10.1.5.123", "freud",
		"password", "");

Collection<ClassDetails> classDetails = serverList
		.listServersWithDetails(new Category[] {
				Categories.OPCDAServer10, Categories.OPCDAServer20,
				Categories.OPCDAServer30 }, new Category[] {});

for (ClassDetails cds : classDetails) {
	System.out.println(cds.getProgId() + "=" + cds.getDescription());
}
{% endhighlight %}

* 列举连接下的所有Group和Item
{% highlight java %}
public static void main(String[] args) throws Exception {
	ConnectionInformation ci = new ConnectionInformation();
	ci.setHost("10.1.5.123");
	ci.setDomain("");
	ci.setUser("freud");
	ci.setPassword("password");
	ci.setClsid("F8582CF2-88FB-11D0-B850-00C0F0104305");

	Server server = new Server(ci, Executors.newSingleThreadScheduledExecutor());

	server.connect();

	dumpTree(server.getTreeBrowser().browse(), 0);
	dumpFlat(server.getFlatBrowser());

	server.disconnect();
}

private static void dumpFlat(final FlatBrowser browser)
		throws IllegalArgumentException, UnknownHostException, JIException {
	for (String name : browser.browse()) {
		System.out.println(name);
	}
}

private static void dumpTree(final Branch branch, final int level) {

	for (final Leaf leaf : branch.getLeaves()) {
		dumpLeaf(leaf, level);
	}
	for (final Branch subBranch : branch.getBranches()) {
		dumpBranch(subBranch, level);
		dumpTree(subBranch, level + 1);
	}
}

private static String printTab(int level) {
	StringBuilder sb = new StringBuilder();
	for (int i = 0; i < level; i++) {
		sb.append("\t");
	}
	return sb.toString();
}

private static void dumpLeaf(final Leaf leaf, final int level) {
	System.out.println(printTab(level) + "Leaf: " + leaf.getName() + ":"
			+ leaf.getItemId());
}

private static void dumpBranch(final Branch branch, final int level) {
	System.out.println(printTab(level) + "Branch: " + branch.getName());
}
{% endhighlight %}

* Item的同步查询
{% highlight java %}
public static void main(String[] args) throws Exception {

	ConnectionInformation ci = new ConnectionInformation();
	ci.setHost("10.1.5.123");
	ci.setDomain("");
	ci.setUser("freud");
	ci.setPassword("password");
	ci.setClsid("F8582CF2-88FB-11D0-B850-00C0F0104305");

	Server server = new Server(ci,
			Executors.newSingleThreadScheduledExecutor());

	server.connect();

	Group group = server.addGroup();
	Item item = group.addItem("Random.Real5");

	Map<String, Item> items = group.addItems("Random.Real1",
			"Random.Real2", "Random.Real3", "Random.Real4");

	dumpItem(item);

	for (Entry<String, Item> temp : items.entrySet()) {
		dumpItem(temp.getValue());
	}

	server.dispose();
}

private static void dumpItem(Item item) throws JIException {
	System.out.println("[" + (++count) + "],ItemName:[" + item.getId()
			+ "],value:" + item.read(false).getValue());
}

private static int count;
{% endhighlight %}

* Item的异步查询
{% highlight java %}
private static final int PERIOD = 100;

private static final int SLEEP = 2000;

public static void main(String[] args) throws Exception {

	ConnectionInformation ci = new ConnectionInformation();
	ci.setHost("10.1.5.123");
	ci.setDomain("");
	ci.setUser("freud");
	ci.setPassword("password");
	ci.setClsid("F8582CF2-88FB-11D0-B850-00C0F0104305");

	Server server = new Server(ci,
			Executors.newSingleThreadScheduledExecutor());

	server.connect();

	AccessBase access = new SyncAccess(server, PERIOD);

	access.addItem("Random.Real5", new DataCallback() {
		private int i;

		public void changed(Item item, ItemState itemstate) {
			System.out.println("[" + (++i) + "],ItemName:[" + item.getId()
					+ "],value:" + itemstate.getValue());
		}
	});

	access.bind();
	Thread.sleep(SLEEP);
	access.unbind();
	server.dispose();
}
{% endhighlight %}

* Item的发布订阅查询
{% highlight java %}
private static final int PERIOD = 100;

private static final int SLEEP = 2000;

public static void main(String[] args) throws Exception {

	ConnectionInformation ci = new ConnectionInformation();
	ci.setHost("10.1.5.123");
	ci.setDomain("");
	ci.setUser("freud");
	ci.setPassword("password");
	ci.setClsid("F8582CF2-88FB-11D0-B850-00C0F0104305");

	Server server = new Server(ci,
			Executors.newSingleThreadScheduledExecutor());

	server.connect();

	AccessBase access = new Async20Access(server, PERIOD, false);

	access.addItem("Random.Real5", new DataCallback() {

		private int count;

		public void changed(Item item, ItemState itemstate) {
			System.out.println("[" + (++count) + "],ItemName:["
					+ item.getId() + "],value:" + itemstate.getValue());
		}
	});

	access.bind();
	Thread.sleep(SLEEP);
	access.unbind();
	server.dispose();
}
{% endhighlight %}

* 自动重连Item异步读取
{% highlight java %}
private static final int PERIOD = 100;

private static final int SLEEP = 2000;

public static void main(String[] args) throws Exception {

	ConnectionInformation ci = new ConnectionInformation();
	ci.setHost("10.1.5.123");
	ci.setDomain("");
	ci.setUser("freud");
	ci.setPassword("password");
	ci.setClsid("F8582CF2-88FB-11D0-B850-00C0F0104305");

	Server server = new Server(ci,
			Executors.newSingleThreadScheduledExecutor());

	AutoReconnectController controller = new AutoReconnectController(server);

	controller.connect();

	AccessBase access = new SyncAccess(server, PERIOD);

	access.addItem("Random.Real5", new DataCallback() {
		private int i;

		public void changed(Item item, ItemState itemstate) {
			System.out.println("[" + (++i) + "],ItemName:[" + item.getId()
					+ "],value:" + itemstate.getValue());
		}
	});

	access.bind();
	Thread.sleep(SLEEP);
	access.unbind();
	controller.disconnect();
}
{% endhighlight %}

* Item同步写入
{% highlight java %}
public static void main(String[] args) throws Exception {

	ConnectionInformation ci = new ConnectionInformation();
	ci.setHost("10.1.5.123");
	ci.setDomain("");
	ci.setUser("freud");
	ci.setPassword("password");
	ci.setClsid("F8582CF2-88FB-11D0-B850-00C0F0104305");

	Server server = new Server(ci,
			Executors.newSingleThreadScheduledExecutor());

	server.connect();

	Group group = server.addGroup();
	Item item = group.addItem("Square Waves.Real4");

	final Float[] integerData = new Float[] { 1202f, 1203f, 1204f };
	final JIArray array = new JIArray(integerData, false);
	final JIVariant value = new JIVariant(array);

	item.write(value);
	Thread.sleep(2000);

	dumpItem(item);

	server.dispose();

}

private static void dumpItem(Item item) throws JIException {
	System.out.println("[" + (++count) + "],ItemName:[" + item.getId()
			+ "],value:" + item.read(true).getValue());
}

private static int count;
{% endhighlight %}

* Item异步写入
{% highlight java %}
{% endhighlight %}

<br>
<br>

参考资料
================================

Matrikon官网: [http://www.matrikonopc.cn/downloads/drivers-index.aspx](http://www.matrikonopc.cn/downloads/drivers-index.aspx)
