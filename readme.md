# SXAN MOBILE

## Built with Nativescript + VUE

* webpack

* rollup

* vue 2.0

## Objectives

* Draw scenes

* Develop API

* Build templates

* Connect plugins

# very important
SMS USE FOR EMERGING MARKETS

## Use

* `rollup -c -w` from main dir

* `tns build ios` and/or `tns build android` to build ios or apk

* `tns run ios` and/or `tns run android` to debug  

## Overview

SXAN is a game that combines Dialogs and Hustles to improve a person's position within their industry or interest group. This software is created by a smart and benevolent bot, with a penchant for break dancing, to guide humankind purposeful existence.

*Dialogs*

Conversations that transpire within the app. Includes direct messaging, commenting, replying, and various automatic responses.

*Hustles*

Activities in the app designed to improve a person's network and skills pertaining to their interests.

## Primary Features

### Dialog types

  * Bot(s) / player(s)
  
  System generates an interactive bot to chat with a player.

  * Bot(s) / bot(s)

  Not just for fun, bots can carry conversations together to provide relevant data to a player.
  
  * Player(s) / player(s)
  
  Standard messaging and responding to private or public forums

  * Player(s) / content(s)

  Posting comments or other activity to a piece of content, such as an article or product.
 
  * Bot(s) / content(s)

  Same as above, only automated based on prequired criteria.
  
** CONTENT(s) / CONTENT(s) WTF?!
  This will happen when our synthetic algos get crafty.
  
  ### Hustle types
  
  * Grind
  
    Recurring activities on a schedule to make a person's position better, day by day.
  
  * Boogie
  
    Activity for a specific goal or reward. This is the standard Hustle.
  
  * Moonwalk
  
    Embark upon a quest. Quests collect any of the other Hustle types to acheive a lofty goal.
    
  * Footwork
  
    Go on an adventure in the real-world.
  
  * Pop'n'lock
  
    Truth a collection of activites for the network to trust. This involves cryptographically sealing and seeding (putting forth sxoins to "stake" the claim.)
    
  * Meta Shuffle
  
    These hustles build the game. It's how our community values and validates contributions to the software itself.
    
## Interest groups
  
SXAN is divided into *n* different interest groups. Identified interest names, such as "toys", "quantum", "developers", "Republic of China", and other commercial industries or government entities, will be ear-marked for consensus purposes but players are free to make up their own networks around their interests. SXAN, the company, will work hard to gather players from specific interest groups when we identify strong networks around common themes. 

Interest groups are further sub-grouped into Tribes. Ex. A company within an industry would be a tribe made up of the company's workers or perhaps your family/roomates would be a tribe for the neighborhood watch group. 

## Improving positions

Within the context of an interest group, a player can dialog with bots and players to learn valuable information. Within the same context, Hustles challenge players to better themselves, the community, or the meta (our softwares). 

Positions are qualified by the community, quantfied by the servers, and understood by the player -- *if one doesn't know where one is, how likely are they to get where they want?*

## Game mechanics

The game encourages and verifies interactivity from a player. Similar to many RPG (role-playing games), SXAN tracks player progress and incentivizes further use. The databases track a players activities in various interest groups and then the algos spin-out various classifications and scores. 

Players and tribes level-up to access functions and enticing opportunities by accumulating validated "Points" towards purposeful existence. Players use our token "sxoins" to make purchases in the game, and our token "sxeys" allow permission to participate in a hustle or use a specific feature. 

Basically, each step is designed to for a player to fairly earn their network priviledges.

### Point types

* eXpierience Points (XP) 

Accumulated across the networks and metaverses.

* Interest Points (IP)

Accumulated across a specific interest network.

* Tribe Points (TP)

Accumulated within tribal-centric activities.

### Levels

* Metasxan - level based on XP
* Interest - level based on IP
* Tribe - level based on TP

### Ranks

* Most active - amount of network activity
* Most useful - quality of network activity
* Best newcomer - Best scores for active and useful for n00bz
* Best - Best running average scores for all players


## Supporting Features (Unlocked with sxeys)

* CMS

Content-management system, like [https://ghost.org/](Ghost)

* Marketplace

Marketplace where players can list products and/or services for sale or shop for the same. 

* Job Listings

Classifieds for finding help and work. Could be career- or gig-oriented.

* Online Learning

Online courses on subjects pertaining to an interest group are taught by advanced players.

## Contributer Workflow

### Setup

1. Create a fork https://github.com/sxan-experience/mobile#fork-destination-box
2. Clone repo in terminal with `git clone https://github.com/sxan-experience/mobile.git`
3. (Once) Add 'upstream' repo to list of remotes with `git remote add upstream https://github.com/`[insert your username here]`/sxan-mobile.git`
4. (Once) Verify the new remote named 'upstream' with `git remote -v`
5. (Optional) Fetch upstream remote to sync your fork with master `git fetch upstream`
6. Checkout your master branch and merge upstream `git checkout master`

### Submitting Work
If a branch is already created, just checkout the branch for step 1 (the last git command)

1. Create a new branch `git checkout master && git branch `[descriptive name of branch, i.e. feature1]` && git checkout `[descriptive name of branch, i.e. feature1]
2. Hack to your heart's delight
3. Fetch upstream and merge `git fetch upstream && git checkout master
 && git merge upstream/master && git checkout `[[descriptive name of branch, i.e. feature1]` && git rebase master`
4. Click the pull request button to submit work.
