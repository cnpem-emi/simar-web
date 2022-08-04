import Vuetify from 'vuetify'
import { createLocalVue, mount } from '@vue/test-utils'
import Toolbar from '@/components/ToolBar.vue'
import Vuex from 'vuex'

describe('Toolbar.vue', () => {
  const keys = ["Temperature", "Pressure", "Rack Open", "Humidity", "Leak"]
  const localVue = createLocalVue()
  localVue.use(Vuex);
  let vuetify
  let store

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() }
    });
  });

  beforeEach(() => {
    vuetify = new Vuetify()

    store = new Vuex.Store({
      state: {
        account: undefined,
        url: "ais-eng-srv-la.cnpem.br",
        message: "",
        msalConfig: {
            auth: {
              clientId: "",
              authority: "validAuthority",
            },
        },
        msalInstance: {
            loginPopup: jest.fn(() => Promise.resolve()),
            getAllAccounts: () => {return [{name: "Cesar", username: "Cesar"}]}
        }
      },
      mutations: {
        setAccount(state, account) {
        state.account = account;
      },
      showSnackbar(state, message) {state.message = message}
    }
    })
  })

  const mountFunction = options => {
    return mount(Toolbar, {
      localVue,
      vuetify,
      store,
      mocks: {
        $vuetify: { breakpoint: {} },
      },
      propsData: {settings: {keys: keys}},
      ...options
    })
  }

  it('displays login button when not logged in', () => {
    const wrapper = mountFunction();
    expect(wrapper.findAll(".col").at(1).find(".v-menu").find(".v-btn--icon").exists()).toBe(true);
  })

  it('displays user initial as avatar when logged in', () => {
    store.commit("setAccount", {name: "Cesar Lattes", initials: "C"});
    const wrapper = mountFunction();
    expect(wrapper.findAll(".col").at(1).find(".v-menu").find("button").find("span").find("div").find("span").text()).toBe("C");
  })

  /*it('creates popup when logging in', async () => {
    const wrapper = mountFunction();
    wrapper.findAll(".col").at(1).find("div").find("button").trigger("click");

    await wrapper.vm.$nextTick();

    expect(store.state.message).toBe("Success");
  })*/
})
