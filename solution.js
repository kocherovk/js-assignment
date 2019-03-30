var allUsers = [];
var allGroups = [];
var allRights = [];
var authenticatedUser;

function remove(array, item) {
	return array.filter(function(elem) { return item != elem });
}

function mustContain(array, item) {
	if (array.indexOf(item) == -1) 
		throw new Error();
}

function users() {
	return allUsers;
}

function groups() {
	return allGroups;
}

function rights() {
	return allRights;
}

function createUser(username, password) {
	return allUsers[allUsers.push({username: username, password: password, groups: []}) - 1];
}

function createGroup() {
	return allGroups[allGroups.push({rights: []}) - 1];
}

function createRight() {
	return allRights[allRights.push({}) - 1];
}

function deleteUser(user) {
	mustContain(allUsers, user);
	allUsers = remove(allUsers, user);
}

function deleteGroup(group) {
	mustContain(allGroups, group);
	allGroups = remove(allGroups, group);
	
	allUsers.forEach(function(user) {
		user.groups = remove(user.groups, group);
	});
}

function deleteRight(right) {
	mustContain(allRights, right);
	allRights = remove(allRights, right);
	allGroups.forEach(function(group) {
		group.rights = remove(group.rights, right);
	});
}

function addRightToGroup(right, group) {
	mustContain(allGroups, group);
	mustContain(allRights, right);
	group.rights.push(right);
}

function addUserToGroup(user, group) {
	mustContain(allGroups, group);
	mustContain(allUsers, user);
	user.groups.push(group);
}

function userGroups(user) {
	mustContain(allUsers, user);
	return user.groups;
}

function groupRights(group) {
	mustContain(allGroups, group);
	return group.rights;
}

function removeRightFromGroup(right, group) {
	mustContain(allGroups, group);
	mustContain(allRights, right);
	mustContain(group.rights, right);
	group.rights = remove(group.rights, right);
}

function removeUserFromGroup(user, group) {
	mustContain(allGroups, group);
	mustContain(allUsers, user);
	mustContain(user.groups, group);
	user.groups = remove(user.groups, group);
}

function login(username, password) {
	if (authenticatedUser)
		return false;

	var user = allUsers.find(function(user) { 
		return user.username === username && user.password === password;
	});

	if (user) {
		authenticatedUser = user;
		return true;
	}

	return false;
}

function logout() {
	authenticatedUser = undefined;
}

function currentUser() {
	return authenticatedUser;
}

function isAuthorized(user, right) {
	mustContain(allRights, right);
	mustContain(allUsers, user);

	return user.groups.reduce(function(result, group) {
		return result.concat(group.rights);
	}, []).indexOf(right) != -1;
}