import type { Action } from '../typings/globals';
import * as path from 'path';
import * as fs from 'fs';

const action: Action<'member' | 'varName' | 'info' | 'varName2' | 'iftrue' | 'iftrueVal' | 'iffalse' | 'iffalseVal'> = {
  name: 'Check If Member',
  section: 'Conditions',
  fields: ['member', 'varName', 'info', 'varName2', 'iftrue', 'iftrueVal', 'iffalse', 'iffalseVal'],

  subtitle(data) {
    const results = [
      'Continue Actions',
      'Stop Action Sequence',
      'Jump To Action',
      'Jump Forward Actions',
      'Jump to Anchor',
    ];
    return `If True: ${results[parseInt(data.iftrue, 10)]} ~ If False: ${results[parseInt(data.iffalse, 10)]}`;
  },

  html(isEvent, data) {
    return `
<div>
  <div style="float: left; width: 35%; padding-top: 12px;">
    Source Member:<br>
    <select id="member" class="round" onchange="glob.memberChange(this, 'varNameContainer')">
      ${data.members[isEvent ? 1 : 0]}
    </select>
  </div>
  <div id="varNameContainer" style="display: none; float: right; width: 60%; padding-top: 12px;">
    Variable Name:<br>
    <input id="varName" class="round" type="text" list="variableList"><br>
  </div>
</div><br><br><br>
<div style="padding-top: 20px;">
  <div style="float: left; width: 35%;">
    Check if Member:<br>
    <select id="info" class="round">
      <option value="0" selected>Is Bot?</option>
      <option value="1">Is Bannable?</option>
      <option value="2">Is Kickable?</option>
      <option value="3">Is Speaking?</option>
      <option value="4">Is In Voice Channel?</option>
      <option value="5">Is User Manageable?</option>
      <option value="6">Is Bot Owner?</option>
      <option value="7">Is Muted?</option>
      <option value="8">Is Deafened?</option>
      ${!isEvent && '<option value="9">Is Command Author?</option>'}
      ${!isEvent && '<option value="10">Is Current Server Owner?</option>'}
    </select>
  </div>
  <div id="varNameContainer2" style="display: none; float: right; width: 60%;">
    Variable Name:<br>
    <input id="varName2" class="round" type="text" list="variableList2"><br>
  </div>
</div><br><br><br>
<div style="padding-top: 8px;">
  ${data.conditions[0]}
</div>`;
  },

  init(this: any) {
    const { glob, document } = this;
    const option = document.createElement('OPTION');
    option.value = '4';
    option.text = 'Jump to Anchor';
    const iffalse = document.getElementById('iffalse');
    if (iffalse.length === 4) iffalse.add(option);

    const option2 = document.createElement('OPTION');
    option2.value = '4';
    option2.text = 'Jump to Anchor';
    const iftrue = document.getElementById('iftrue');
    if (iftrue.length === 4) iftrue.add(option2);

    glob.onChangeTrue = function onChangeTrue(event: any) {
      switch (parseInt(event.value, 10)) {
        case 0:
        case 1:
          document.getElementById('iftrueContainer').style.display = 'none';
          break;
        case 2:
          document.getElementById('iftrueName').innerHTML = 'Action Number';
          document.getElementById('iftrueContainer').style.display = null;
          break;
        case 3:
          document.getElementById('iftrueName').innerHTML = 'Number of Actions to Skip';
          document.getElementById('iftrueContainer').style.display = null;
          break;
        case 4:
          document.getElementById('iftrueName').innerHTML = 'Anchor ID';
          document.getElementById('iftrueContainer').style.display = null;
          break;
        default:
          break;
      }
    };
    glob.onChangeFalse = function onChangeFalse(event: any) {
      switch (parseInt(event.value, 10)) {
        case 0:
        case 1:
          document.getElementById('iffalseContainer').style.display = 'none';
          break;
        case 2:
          document.getElementById('iffalseName').innerHTML = 'Action Number';
          document.getElementById('iffalseContainer').style.display = null;
          break;
        case 3:
          document.getElementById('iffalseName').innerHTML = 'Number of Actions to Skip';
          document.getElementById('iffalseContainer').style.display = null;
          break;
        case 4:
          document.getElementById('iffalseName').innerHTML = 'Anchor ID';
          document.getElementById('iffalseContainer').style.display = null;
          break;
        default:
          break;
      }
    };
    glob.memberChange(document.getElementById('member'), 'varNameContainer');
    glob.onChangeTrue(document.getElementById('iftrue'));
    glob.onChangeFalse(document.getElementById('iffalse'));
  },

  action(this, cache) {
    const data = cache.actions[cache.index];
    const type = parseInt(data.member, 10);
    const varName = this.evalMessage(data.varName, cache);
    const member = this.getMember(type, varName, cache);
    const info = parseInt(data.info, 10);
    const { Files } = this.getDBM();
    const { msg } = cache;

    let result = false;
    switch (info) {
      case 0:
        result = this.dest(member.user, 'bot') || member.user.bot;
        break;
      case 1:
        result = member.bannable;
        break;
      case 2:
        result = member.kickable;
        break;
      case 3:
        result = Boolean(this.dest(member.voice, 'speaking'));
        break;
      case 4:
        result = Boolean(this.dest(member.voice, 'channel'));
        break;
      case 5:
        result = member.manageable;
        break;
      case 6: {
        const filePath = path.join(__dirname, '../data', 'multiple_bot_owners.json');
        if (!fs.existsSync(filePath)) {
          result = member.id === Files.data.settings.ownerId;
        } else {
          result =
            JSON.parse(fs.readFileSync(filePath, 'utf8')).includes(member.id) ||
            member.id === Files.data.settings.ownerId;
        }
        break;
      }
      case 7:
        result = Boolean(this.dest(member.voice, 'mute'));
        break;
      case 8:
        result = Boolean(this.dest(member.voice, 'deaf'));
        break;
      case 9:
        result = member.id === msg.author.id;
        break;
      case 10:
        result = member.id === msg.guild?.ownerID;
        break;
      default:
        console.log('Please check your "Check if Member" action! There is something wrong...');
        break;
    }
    this.executeResults(result, data, cache);
  },

  mod() {},
};

module.exports = action;