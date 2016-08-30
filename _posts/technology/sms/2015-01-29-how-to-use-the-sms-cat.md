---
layout: post
title:  金迪短信猫的使用笔记
date:   2015-01-29 15:52:00 +0800
categories: 技术文档
tag: 短信猫
---

* content
{:toc}


安装
----------------------

* 插入短信猫设备。由于公司代理问题，驱动未正确安装，
手动下载[PL2303_Prolific_GPS_AllInOne_1013.exe](/resources/sms/PL2303_Prolific_DriverInstaller_v1100.exe)，完成之后重启机器
* 导入所需的jar包[jdsmsserver-3.4.6.jar](/resources/sms/jdsmsserver-3.4.6.jar),[RXTXcomm.jar](/resources/sms/RXTXcomm.jar)和[sendsms-3.4.6.jar](/resources/sms/sendsms-3.4.6.jar)
* Windows环境下将[rxtxSerial.dll](/resources/sms/rxtxSerial.dll)文件放入jdk和jre的bin目录下。
* Linux环境下
	* 将[RXTXcomm.jar](/resources/sms/RXTXcomm.jar)文件复制到jdk1.6\jre\lib\ext目录下。
	* 32位：将[librxtxSerial.so](/resources/sms/librxtxSerial.so)文件复制到 jdk1.6\jre\lib\i386目录下。
	* 64位：将[librxtxSerial.so](/resources/sms/amd64/librxtxSerial.so)文件到jdk1.6\jre\lib\amd64目录下。
* 插入短信猫设备，然后执行CommonTest文件，

{% highlight java%}

//金笛短信服务器 v3.2 
//自动检测设备的端口、波特率

import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.Formatter;
import cn.sendsms.helper.CommPortIdentifier;
import cn.sendsms.helper.SerialPort;

public class CommTest
{
	private static final String _NO_DEVICE_FOUND = "  没找到短信设备";

	private final static Formatter _formatter = new Formatter(System.out);

	static CommPortIdentifier portId;

	static Enumeration<CommPortIdentifier> portList;

	static int bauds[] = { 9600, 14400, 19200, 28800, 33600, 38400, 56000, 57600, 115200 };

	private static Enumeration<CommPortIdentifier> getCleanPortIdentifiers()
	{
		return CommPortIdentifier.getPortIdentifiers();
	}

	/**
	 * 逐个扫描串口，分别用不同连接速率做连接测试，如果连接成功，返回设备信息。
	 * 
	 */

	public static void main(String[] args)
	{
		System.out.println("\n搜索所有短信设备...");
		portList = getCleanPortIdentifiers();
		while (portList.hasMoreElements())
		{
			portId = portList.nextElement();
			if (portId.getPortType() == CommPortIdentifier.PORT_SERIAL)
			{
				_formatter.format("%n找到端口: %-5s%n", portId.getName());
				for (int i = 0; i < bauds.length; i++)
				{
					SerialPort serialPort = null;
					_formatter.format("       尝试连接速率 %6d...", bauds[i]);
					try
					{
						InputStream inStream;
						OutputStream outStream;
						int c;
						String response;
						serialPort = portId.open("jdsmsCommTester", 1200);
						serialPort.setFlowControlMode(SerialPort.FLOWCONTROL_RTSCTS_IN);
						serialPort.setSerialPortParams(bauds[i], SerialPort.DATABITS_8, SerialPort.STOPBITS_1, SerialPort.PARITY_NONE);
						inStream = serialPort.getInputStream();
						outStream = serialPort.getOutputStream();
						serialPort.enableReceiveTimeout(1000);
						c = inStream.read();
						while (c != -1)
							c = inStream.read();
						outStream.write('A');
						outStream.write('T');
						outStream.write('\r');
						Thread.sleep(1000);
						response = "";
						c = inStream.read();
						while (c != -1)
						{
							response += (char) c;
							c = inStream.read();
						}
						if (response.indexOf("OK") >= 0)
						{
							try
							{
								System.out.print("  Getting Info...");
								outStream.write('A');
								outStream.write('T');
								outStream.write('+');
								outStream.write('C');
								outStream.write('G');
								outStream.write('M');
								outStream.write('M');
								outStream.write('\r');
								response = "";
								c = inStream.read();
								while (c != -1)
								{
									response += (char) c;
									c = inStream.read();
								}
								System.out.println(" 发现: " + response.replaceAll("\\s+OK\\s+", "").replaceAll("\n", "").replaceAll("\r", ""));
							}
							catch (Exception e)
							{
								System.out.println(_NO_DEVICE_FOUND);
							}
						}
						else
						{
							System.out.println(_NO_DEVICE_FOUND);
						}
					}
					catch (Exception e)
					{
						System.out.print(_NO_DEVICE_FOUND);
						Throwable cause = e;
						while (cause.getCause() != null)
						{
							cause = cause.getCause();
						}
						System.out.println(" (" + cause.getMessage() + ")");
					}
					finally
					{
						if (serialPort != null)
						{
							serialPort.close();
						}
					}
				}
			}
		}
		System.out.println("\n测试完成.");
	}
}
{% endhighlight %}

测试结果如下，为已经找到短信猫设备，

{% highlight text %}
搜索所有短信设备...
Stable Library
=========================================
Native lib Version = RXTX-2.1-7
Java lib Version   = RXTX-2.1-7

找到端口: COM1 
       尝试连接速率   9600...  没找到短信设备
       尝试连接速率  14400...  没找到短信设备
       尝试连接速率  19200...  没找到短信设备
       尝试连接速率  28800...  没找到短信设备
       尝试连接速率  33600...  没找到短信设备
       尝试连接速率  38400...  没找到短信设备
       尝试连接速率  56000...  没找到短信设备
       尝试连接速率  57600...  没找到短信设备
       尝试连接速率 115200...  没找到短信设备

找到端口: COM3 
       尝试连接速率   9600...  没找到短信设备
       尝试连接速率  14400...  没找到短信设备
       尝试连接速率  19200...  没找到短信设备
       尝试连接速率  28800...  没找到短信设备
       尝试连接速率  33600...  没找到短信设备
       尝试连接速率  38400...  没找到短信设备
       尝试连接速率  56000...  没找到短信设备
       尝试连接速率  57600...  没找到短信设备
       尝试连接速率 115200...  没找到短信设备

找到端口: COM4 
       尝试连接速率   9600...  Getting Info... 发现: AT+CGMM MULTIBAND  900E  1800
       尝试连接速率  14400...  Getting Info... 发现: AT+CGMM MULTIBAND  900E  1800
       尝试连接速率  19200...  没找到短信设备
       尝试连接速率  28800...  Getting Info... 发现: AT+CGMM MULTIBAND  900E  1800
       尝试连接速率  33600...  Getting Info... 发现: AT+CGMM MULTIBAND  900E  1800
       尝试连接速率  38400...  没找到短信设备
       尝试连接速率  56000...  Getting Info... 发现: AT+CGMM MULTIBAND  900E  1800
       尝试连接速率  57600...  没找到短信设备
       尝试连接速率 115200...  没找到短信设备

测试完成.
{% endhighlight %}

出现以上`Getting Info`就代表已经安装成功了

读取短信
---------------------------------
> + `cme error 10`代表`SIM CARD NO INSERT`的Error
{% highlight java%}
// ReadMessages.java - 读取并显示短信.
//
// 任务:
// 1) 定义Service对象。
// 2) 设置一个或者多个短信通道Gateway。
// 3) 绑定Gateway到Service。
// 4) 设置Callback。
// 5) 运行。

import java.util.ArrayList;
import java.util.List;

import cn.sendsms.AGateway;
import cn.sendsms.AGateway.Protocols;
import cn.sendsms.ICallNotification;
import cn.sendsms.IGatewayStatusNotification;
import cn.sendsms.IInboundMessageNotification;
import cn.sendsms.IOrphanedMessageNotification;
import cn.sendsms.InboundMessage;
import cn.sendsms.InboundMessage.MessageClasses;
import cn.sendsms.Library;
import cn.sendsms.Message.MessageTypes;
import cn.sendsms.Service;
import cn.sendsms.helper.AGatewayHelper.GatewayStatuses;
import cn.sendsms.modem.SerialModemGateway;

public class ReadMessages {
	Service srv;

	public void doIt() throws Exception {

		// 收到的短信列表.
		List<InboundMessage> msgList;

		// 处理状态报告。
		InboundNotification inboundNotification = new InboundNotification();

		// 处理语音呼入.
		CallNotification callNotification = new CallNotification();

		// 处理短信通道的状态.
		GatewayStatusNotification statusNotification = new GatewayStatusNotification();

		OrphanedMessageNotification orphanedMessageNotification = new OrphanedMessageNotification();

		try {
			System.out.println("示例: 从串口短信设备读取并显示短信.");
			System.out.println(Library.getLibraryDescription());
			System.out.println("版本: " + Library.getLibraryVersion());

			// 创建一个服务对象

			this.srv = Service.getInstance();

			// 创建一个gateway对象，一个gateway对应一个短信设备。
			SerialModemGateway gateway = new SerialModemGateway("jindi",
					"COM4", 9600, "", "");

			// 设置短信编码格式，默认为 PDU (如果只发送英文，请设置为TEXT)。
			gateway.setProtocol(Protocols.PDU);

			// 设置通道gateway是否处理接受到的短信
			gateway.setInbound(true);

			// 设置是否可发送短信
			gateway.setOutbound(true);

			// SIM PIN.
			gateway.setSimPin("0000");

			// 设置状态报告处理.

			this.srv.setInboundMessageNotification(inboundNotification);
			this.srv.setCallNotification(callNotification);
			this.srv.setGatewayStatusNotification((IGatewayStatusNotification) statusNotification);
			this.srv.setOrphanedMessageNotification(orphanedMessageNotification);

			// 添加Gateway到Service对象，如果有多个Gateway，都要一一添加。
			this.srv.addGateway(gateway);

			// 启动服务
			this.srv.startService();

			// 显示和硬件设备相关的信息.
			System.out.println();
			System.out.println("设备信息:");
			System.out.println("  厂  商: " + gateway.getManufacturer());
			System.out.println("  型  号: " + gateway.getModel());
			System.out.println("  序列号: " + gateway.getSerialNo());
			System.out.println("  IMSI号: " + gateway.getImsi());
			System.out.println("  信  号: " + gateway.getSignalLevel() + "%");
			System.out.println("  电  池: " + gateway.getBatteryLevel() + "%");
			System.out.println();

			// 定义msgList
			msgList = new ArrayList<InboundMessage>();

			// 读取所有短信到msgList
			this.srv.readMessages(msgList, MessageClasses.ALL);

			// 循环打印
			for (InboundMessage msg : msgList)
				System.out.println(msg);

			// 此处进入输入等待. 主要目的是为了处理收到的短信或者语音事件。

			System.out.println("按<回车>键退出...");
			System.in.read();
			System.in.read();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			srv.stopService();
		}
	}

	public class InboundNotification implements IInboundMessageNotification {
		public void process(String gatewayId, MessageTypes msgType,
				InboundMessage msg) {
			if (msgType == MessageTypes.INBOUND)
				System.out.println(">>> 收到短信: " + gatewayId);
			else if (msgType == MessageTypes.STATUSREPORT)
				System.out.println(">>> 收到短信状态报告: " + gatewayId);
			System.out.println(msg);
			try { // 删除收到的短信. //
					// ReadMessages.this.srv.deleteMessage(msg);
			} catch (Exception e) {
				System.out.println("删除短信失败...");
				e.printStackTrace();
			}
		}

		@Override
		public void process(AGateway agateway, MessageTypes messagetypes,
				InboundMessage inboundmessage) {
			if (messagetypes == MessageTypes.INBOUND)
				System.out.println(">>> 收到短信: " + agateway.getGatewayId());
			else if (messagetypes == MessageTypes.STATUSREPORT)
				System.out.println(">>> 收到短信状态报告: " + agateway.getGatewayId());
			System.out.println(inboundmessage);
			try { // 删除收到的短信. //
					// ReadMessages.this.srv.deleteMessage(inboundmessage);
			} catch (Exception e) {
				System.out.println("删除短信失败...");
				e.printStackTrace();
			}

		}
	}

	// class InboundNotification implements IInboundMessageNotification {
	// public void process(AGateway gateway, MessageTypes msgType,
	// InboundMessage msg) {
	// if (msgType == MessageTypes.INBOUND)
	// System.out
	// .println(">>> New Inbound message detected from Gateway: "
	// + gateway.getGatewayId());
	// else if (msgType == MessageTypes.STATUSREPORT)
	// System.out
	// .println(">>> New Inbound Status Report message detected from Gateway: "
	// + gateway.getGatewayId());
	// System.out.println(msg);
	// }
	// }

	public class CallNotification implements ICallNotification {
		public void process(String gatewayId, String callerId) {
			System.out.println(">>> 有电话呼入: " + gatewayId + " : " + callerId);
		}

		@Override
		public void process(AGateway agateway, String s) {
			System.out.println(">>> 有电话呼入: " + agateway.getGatewayId() + " : "
					+ s);
		}
	}

	// class CallNotification implements ICallNotification {
	// public void process(AGateway gateway, String callerId) {
	// System.out.println(">>> New call detected from Gateway: "
	// + gateway.getGatewayId() + " : " + callerId);
	// }
	// }

	public class GatewayStatusNotification implements
			IGatewayStatusNotification {
		@Override
		public void process(AGateway agateway, GatewayStatuses gatewaystatuses,
				GatewayStatuses gatewaystatuses1) {
			System.out.println(">>> 设备状态 " + agateway.getGatewayId()
					+ ", OLD: " + gatewaystatuses + " -> NEW: "
					+ gatewaystatuses1);
		}
	}

	// class GatewayStatusNotification implements IGatewayStatusNotification {
	// public void process(AGateway gateway, GatewayStatuses oldStatus,
	// GatewayStatuses newStatus) {
	// System.out.println(">>> Gateway Status change for "
	// + gateway.getGatewayId() + ", OLD: " + oldStatus
	// + " -> NEW: " + newStatus);
	// }
	// }

	class OrphanedMessageNotification implements IOrphanedMessageNotification {
		public boolean process(AGateway gateway, InboundMessage msg) {
			System.out.println(">>> Orphaned message part detected from "
					+ gateway.getGatewayId());
			System.out.println(msg);
			// Since we are just testing, return FALSE and keep the orphaned
			// message part.
			return false;
		}
	}

	public static void main(String args[]) {
		ReadMessages app = new ReadMessages();
		try {
			app.doIt();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
{% endhighlight %}

发送短信
-------------------------------------------
{% highlight java %}
// SendMessage.java - 金笛短信服务器 v3.2 发送示例.

import cn.sendsms.AGateway;
import cn.sendsms.IOutboundMessageNotification;
import cn.sendsms.Library;
import cn.sendsms.Message;
import cn.sendsms.OutboundMessage;
import cn.sendsms.Service;
import cn.sendsms.modem.SerialModemGateway;

public class SendMessage {
	public void doIt() throws Exception {

		Service srv;
		OutboundMessage msg;
		OutboundNotification outboundNotification = new OutboundNotification();
		System.out.println("示例: 通过串口短信设备发送短信.");
		System.out.println(Library.getLibraryDescription());
		System.out.println("版本: " + Library.getLibraryVersion());
		srv = Service.getInstance();
		SerialModemGateway gateway = new SerialModemGateway("modem.com4",
				"COM5", 9600, "wavecom", "");
		gateway.setInbound(true);
		gateway.setOutbound(true);
		gateway.setSimPin("0000");
		srv.setOutboundMessageNotification(outboundNotification);
		srv.addGateway(gateway);
		srv.startService();
		System.out.println();
		System.out.println("设备信息:");

		System.out.println("  厂  商: " + gateway.getManufacturer());
		System.out.println("  型  号: " + gateway.getModel());
		System.out.println("  序列号: " + gateway.getSerialNo());
		System.out.println("  IMSI号: " + gateway.getImsi());
		System.out.println("  信  号: " + gateway.getSignalLevel() + "%");
		System.out.println("  电  池: " + gateway.getBatteryLevel() + "%");

		System.out.println();

		// 发送短信
		msg = new OutboundMessage("18941119891", "Just For Test-测试短信");
		msg.setEncoding(Message.MessageEncodings.ENCUCS2);
		msg.setStatusReport(true);

		srv.sendMessage(msg);
		System.out.println(msg);

		System.out.println("按<回车>键退出...");
		System.in.read();
		srv.stopService();
	}

	class OutboundNotification implements IOutboundMessageNotification {
		@Override
		public void process(AGateway gateway, OutboundMessage msg) {
			System.out.println("状态报告: " + gateway.getGatewayId());
			System.out.println(msg);
		}
	}

	public static void main(String args[]) {
		SendMessage app = new SendMessage();
		try {
			app.doIt();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
{% endhighlight %}

AT命令列表
-------------------------------------------
[http://blog.chinaunix.net/uid-7491192-id-2051153.html](http://blog.chinaunix.net/uid-7491192-id-2051153.html)

遇到问题
-------------------------------------------

第一条短信可以成功发送，但是第二条会出错，报错如下

> org.smslib.TimeoutException: No response from device 

并且串口会一直被占用，插拔设备都不管用。解决方法如下
> 在Service.getInstance()之前设置
{% highlight java %}
System.setProperty("sendsms.nocops", new String());
System.setProperty("sendsms.serial.polling", new String());
{% endhighlight %}