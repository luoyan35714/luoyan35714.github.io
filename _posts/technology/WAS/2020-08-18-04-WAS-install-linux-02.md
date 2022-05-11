---
layout: post
title:  "Websphere Application Server(04)--WAS ND在Linux下的集群安装-2-安装WAS ND集群"
date:   2020-08-18 11:31:01 +0800
category : 技术文档
tag: WebSphere Application Server
---

* content
{:toc}


## 1. 设置两个虚拟机的hosts文件, 分别为两个IP添加别名

```bash
$ cat /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6

192.168.62.191 wasnode1
192.168.62.192 wasnode2
```

## 2. DMGR
登录was-01然后执行如下命令
```bash
$ cd /opt/IBM/WebSphere/AppServer/bin/
#创建DMGR
$ ./manageprofiles.sh -create -templatePath /opt/IBM/WebSphere/AppServer/profileTemplates/management -serverType DEPLOYMENT_MANAGER -profileName dmgr_test -profilePath /opt/IBM/WebSphere/AppServer/profiles/dmgr_test -enableAdminSecurity true -adminUserName wasadmin -adminPassword wasadmin -cellName first_cell -hostName wasnode1
INSTCONFSUCCESS: Success: Profile dmgr_test now exists. Please consult /opt/IBM/WebSphere/AppServer/profiles/dmgr_test/logs/AboutThisProfile.txt for more information about this profile.
```

启动DMGR
```bash
$ cd /opt/IBM/WebSphere/AppServer/profiles/dmgr_test/bin
$ ./startManager.sh
ADMU0116I: Tool information is being logged in file
           /opt/IBM/WebSphere/AppServer/profiles/dmgr_test/logs/dmgr/startServer.log
ADMU0128I: Starting tool with the dmgr_test profile
ADMU3100I: Reading configuration for server: dmgr
ADMU3200I: Server launched. Waiting for initialization status.
ADMU3000I: Server dmgr open for e-business; process id is 13401
```

验证DMGR是否安装成功，打开浏览器输入 `https://192.168.62.191:9043/ibm/console` ，使用`wasadmin/wasadmin`进行登录

此处有个问题就是。centos安装完成默认防火墙是开启的，由于所涉及的端口比较多，所以此处暂时将防火墙关闭。
```bash
systemctl stop firewalld
```

## 3. 在191虚拟机中创建一个Node1

```bash
$ cd /opt/IBM/WebSphere/AppServer/bin
$ ./manageprofiles.sh -create -profileName node1 -profilePath /opt/IBM/WebSphere/AppServer/profiles/node1 -templatePath /opt/IBM/WebSphere/AppServer/profileTemplates/managed -hostName wasnode1
INSTCONFSUCCESS: Success: Profile node1 now exists. Please consult /opt/IBM/WebSphere/AppServer/profiles/node1/logs/AboutThisProfile.txt for more information about this profile.
```

将新创建的Node加入DMGR的管理中
```bash
$ cd /opt/IBM/WebSphere/AppServer/profiles/node1/bin/
$ ./addNode.sh wasnode1 8879
ADMU0116I: Tool information is being logged in file
           /opt/IBM/WebSphere/AppServer/profiles/node1/logs/addNode.log
ADMU0128I: Starting tool with the node1 profile
CWPKI0308I: Adding signer alias "CN=wasnode1, OU=Root Certificat" to local
           keystore "ClientDefaultTrustStore" with the following SHA digest:
           78:2F:49:0A:4A:40:31:E1:CD:15:F6:29:8B:F5:EC:22:D7:1D:63:86
CWPKI0309I: All signers from remote keystore already exist in local keystore.
ADMU0001I: Begin federation of node wasnode1Node01 with Deployment Manager at
           wasnode1:8879.
ADMU0009I: Successfully connected to Deployment Manager Server: wasnode1:8879
ADMU0507I: No servers found in configuration under:
           /opt/IBM/WebSphere/AppServer/profiles/node1/config/cells/wasnode1Node01Cell/nodes/wasnode1Node01/servers
ADMU2010I: Stopping all server processes for node wasnode1Node01
ADMU0024I: Deleting the old backup directory.
ADMU0015I: Backing up the original cell repository.
ADMU0012I: Creating Node Agent configuration for node: wasnode1Node01
ADMU0014I: Adding node wasnode1Node01 configuration to cell: first_cell
ADMU0016I: Synchronizing configuration between node and cell.
ADMU0018I: Launching Node Agent process for node: wasnode1Node01
ADMU0020I: Reading configuration for Node Agent process: nodeagent
ADMU0022I: Node Agent launched. Waiting for initialization status.
ADMU0030I: Node Agent initialization completed successfully. Process id is:
           14464
ADMU0300I: The node wasnode1Node01 was successfully added to the first_cell
           cell.
ADMU0306I: Note:
ADMU0302I: Any cell-level documents from the standalone first_cell
           configuration have not been migrated to the new cell.
ADMU0307I: You might want to:
ADMU0303I: Update the configuration on the first_cell Deployment Manager with
           values from the old cell-level documents.
ADMU0306I: Note:
ADMU0304I: Because -includeapps was not specified, applications installed on
           the standalone node were not installed on the new cell.
ADMU0307I: You might want to:
ADMU0305I: Install applications onto the first_cell cell using wsadmin
           $AdminApp or the Administrative Console.


ADMU0003I: Node wasnode1Node01 has been successfully federated.
```

查看Node是否被加入到DMGR管理中: 在网页Console中点击 `System Administration` -> `Nodes`

![图片](/images/blog/WAS/04-was-nd-install-linux-2/01-console-nodes.png)

## 4. 在192中创建一个Node2

创建Node2
```bash
$ cd /opt/IBM/WebSphere/AppServer/bin
$ ./manageprofiles.sh -create -profileName node2 -profilePath /opt/IBM/WebSphere/AppServer/profiles/node2 -templatePath /opt/IBM/WebSphere/AppServer/profileTemplates/managed -hostName wasnode2
INSTCONFSUCCESS: Success: Profile node2 now exists. Please consult /opt/IBM/WebSphere/AppServer/profiles/node2/logs/AboutThisProfile.txt for more information about this profile.
```

将Node2加入到DMGR的管理中
```bash
$ cd /opt/IBM/WebSphere/AppServer/profiles/node2/bin/
$ ./addNode.sh wasnode1 8879
ADMU0116I: Tool information is being logged in file
           /opt/IBM/WebSphere/AppServer/profiles/node2/logs/addNode.log
ADMU0128I: Starting tool with the node2 profile
CWPKI0308I: Adding signer alias "CN=wasnode1, OU=Root Certificat" to local
           keystore "ClientDefaultTrustStore" with the following SHA digest:
           78:2F:49:0A:4A:40:31:E1:CD:15:F6:29:8B:F5:EC:22:D7:1D:63:86
CWPKI0309I: All signers from remote keystore already exist in local keystore.
ADMU0001I: Begin federation of node wasnode2Node01 with Deployment Manager at
           wasnode1:8879.
ADMU0009I: Successfully connected to Deployment Manager Server: wasnode1:8879
ADMU0507I: No servers found in configuration under:
           /opt/IBM/WebSphere/AppServer/profiles/node2/config/cells/wasnode2Node01Cell/nodes/wasnode2Node01/servers
ADMU2010I: Stopping all server processes for node wasnode2Node01
ADMU0024I: Deleting the old backup directory.
ADMU0015I: Backing up the original cell repository.
ADMU0012I: Creating Node Agent configuration for node: wasnode2Node01
ADMU0014I: Adding node wasnode2Node01 configuration to cell: first_cell
ADMU0016I: Synchronizing configuration between node and cell.
ADMU0018I: Launching Node Agent process for node: wasnode2Node01
ADMU0020I: Reading configuration for Node Agent process: nodeagent
ADMU0022I: Node Agent launched. Waiting for initialization status.
ADMU0030I: Node Agent initialization completed successfully. Process id is:
           11700
ADMU0300I: The node wasnode2Node01 was successfully added to the first_cell
           cell.
ADMU0306I: Note:
ADMU0302I: Any cell-level documents from the standalone first_cell
           configuration have not been migrated to the new cell.
ADMU0307I: You might want to:
ADMU0303I: Update the configuration on the first_cell Deployment Manager with
           values from the old cell-level documents.
ADMU0306I: Note:
ADMU0304I: Because -includeapps was not specified, applications installed on
           the standalone node were not installed on the new cell.
ADMU0307I: You might want to:
ADMU0305I: Install applications onto the first_cell cell using wsadmin
           $AdminApp or the Administrative Console.
ADMU0003I: Node wasnode2Node01 has been successfully federated.
```

查看Node是否被加入到DMGR管理中

![图片](/images/blog/WAS/04-was-nd-install-linux-2/02-console-nodes-with-node2.png)

## 5. 设置Node同步
在WEB Console中点击 `System Administrator` -> `Console Preferences`，确保`Synchronize changes with Nodes`选项是选中状态，`保存`

![图片](/images/blog/WAS/04-was-nd-install-linux-2/03-synchronize-nodes.png)
