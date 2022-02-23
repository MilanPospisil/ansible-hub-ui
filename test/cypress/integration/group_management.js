describe('Hub Group Management Tests', () => {
  before(() => {
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestGroups();
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.deleteTestUsers();
    cy.deleteTestUsers();
  });

  beforeEach(() => {
    cy.login();
  });

  it('admin user can create/delete a group', () => {
    let name = 'testGroup';

    cy.createGroup(name);
    cy.contains(name).should('exist');

    cy.deleteGroup(name);
    cy.contains('No groups yet').should('exist');
  });

  it('admin user can add/remove a user to/from a group', () => {
    let groupName = 'testGroup';
    let userName = 'testUser';

    cy.galaxykit('group create', groupName);
    cy.galaxykit('user create', userName, userName + 'Password');
    cy.galaxykit('user group add', userName, groupName);

    cy.removeUserFromGroup(groupName, userName);
    cy.galaxykit('group delete', groupName);
    cy.deleteUser(userName);
  });

  it('admin user can add/remove permissions to/from a group', () => {
    let name = 'testGroup';
    let permissionTypes = [
      'namespaces',
      'collections',
      'users',
      'groups',
      'remotes',
    ];

    cy.galaxykit('group create', name);

    cy.addAllPermissions(name);
    permissionTypes.forEach((permGroup) => {
      cy.get(`.pf-l-flex.pf-m-align-items-center.${permGroup}`)
        .contains('span', 'No permission')
        .should('not.exist');
    });

    cy.removeAllPermissions(name);
    permissionTypes.forEach((permGroup) => {
      cy.get(`.pf-l-flex.pf-m-align-items-center.${permGroup}`)
        .contains('span', 'No permission')
        .should('exist');
    });

    cy.galaxykit('group delete', name);
  });
});
