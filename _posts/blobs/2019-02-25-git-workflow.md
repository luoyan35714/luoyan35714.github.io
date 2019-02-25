---
layout:       post
title:        Git的三种workflow和最佳实践
date:         2019-02-25 22:39:00 +0800
categories:   杂乱
tag:          VMWare
---

* content
{:toc}


Git的三种workflow
======================

Git flow
----------------------

![/images/blog/blobs/git-workflow/01-git-flow.png](/images/blog/blobs/git-workflow/01-git-flow.png)

Github flow
----------------------

![/images/blog/blobs/git-workflow/02-github-flow.png](/images/blog/blobs/git-workflow/02-github-flow.png)

+ 第一步：根据需求，从master拉出新分支，不区分功能分支或补丁分支。
+ 第二步：新分支开发完成后，或者需要讨论的时候，就向master发起一个pull request（简称PR）。
+ 第三步：Pull Request既是一个通知，让别人注意到你的请求，又是一种对话机制，大家一起评审和讨论你的代码。对话过程中，你还可以不断提交代码。
+ 第四步：你的Pull Request被接受，合并进master，重新部署后，原来你拉出来的那个分支就被删除。（先部署再合并也可。）

Gitlab flow
----------------------

![/images/blog/blobs/git-workflow/03-gitlab-flow.png](/images/blog/blobs/git-workflow/03-gitlab-flow.png)

> Gitlab flow 的最大原则叫做"上游优先"（upsteam first），即只存在一个主分支master，它是所有其他分支的"上游"。只有上游分支采纳的代码变化，才能应用到其他分支。


Git工作流最佳实践
======================

产品及开发-方法一
----------------------

![/images/blog/blobs/git-workflow/04-best-practice-01.png](/images/blog/blobs/git-workflow/04-best-practice-01.png)

推荐在使用Bitbucket作为代码仓库的时候使用，在本模型中多了一个remote own repository的中间仓库。责任是每个人对自己的代码最细粒度的管控。保证不会出现互相恶意修改和提交的问题，适合较大型团队，如果没有auto sync模型或者小型团队可以选择省去中间remote own repository的中间仓库来节省存储空间。

如果使用github作为代码仓库，关于在github上fork的项目无法自动同步源项目解决方案：

{% highlight bash %}
git clone http://host:ip/my_project
git version -v
git remote add up_stream  http://host:ip/origin_project
git removete -v
git pull up_stream develop
{% endhighlight %}

产品及开发-方法二
----------------------

![/images/blog/blobs/git-workflow/05-best-practice-02.png](/images/blog/blobs/git-workflow/05-best-practice-02.png)

小型团队或以github作为代码仓库的团队推荐使用。

Hotfix
----------------------

![/images/blog/blobs/git-workflow/06-hotfix.png](/images/blog/blobs/git-workflow/06-hotfix.png)


参考资料 
======================

A successful Git branching model: [https://nvie.com/posts/a-successful-git-branching-model/](https://nvie.com/posts/a-successful-git-branching-model/)

Understanding the GitHub flow: [https://guides.github.com/introduction/flow/](https://guides.github.com/introduction/flow/)

GitLab Flow: [https://about.gitlab.com/2014/09/29/gitlab-flow/](https://about.gitlab.com/2014/09/29/gitlab-flow/)

Git 工作流程 : [http://www.ruanyifeng.com/blog/2015/12/git-workflow.html](http://www.ruanyifeng.com/blog/2015/12/git-workflow.html)
