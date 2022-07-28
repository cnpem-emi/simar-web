import Vuetify from 'vuetify'
import { createLocalVue, mount } from '@vue/test-utils'
import RackCard from '@/components/RackCard.vue'
import { EMPTY_PVS } from '@/assets/constants'
import Vuex from 'vuex'


describe('RackCard.vue', () => {
  const keys = ["Temperature", "Pressure", "Rack Open", "Humidity", "Leak"]
  const localVue = createLocalVue()
  localVue.use(Vuex);
  let vuetify
  let store

  beforeEach(() => {
    vuetify = new Vuetify()

    store = new Vuex.Store({
      state: {
        msalConfig: {
          auth: {
            clientId: process.env.VUE_APP_ID,
            authority: process.env.VUE_APP_AUTH,
          },
          cache: {
            cacheLocation: "localStorage",
          },
        },
        sw: undefined,
        accessToken: "",
        msalInstance: "",
        account: undefined,
        message: "",
        snackbar: false,
        url: "ais-eng-srv-la.cnpem.br",
        notifications: [],
        notification_count: 0
      },
    })
  })
  const mountFunction = options => {
    return mount(RackCard, {
      localVue,
      vuetify,
      store,
      mocks: {
        $vuetify: { breakpoint: {} }
      },
      ...options
    })
  }

  it('renders all passed keys', () => {
    const wrapper = mountFunction({ propsData: { item: { name: "Test", parent: "Test", pv_names: ["Test:PV:Temp-Mon", "Test:PV:Pressure-Mon"], pvs: EMPTY_PVS }, filtered_keys: keys } });

    const list = wrapper.find(".v-card").find(".v-list").findAll(".v-list-item__content");

    for (let i = 0; i < list.length; i++) {
      expect(list.at(i).text()).toMatch(keys[i] + ":");
    }
  })

  it('sets ? as value for unassigned values', () => {
    const wrapper = mountFunction({ propsData: { item: { name: "Test", parent: "Test", pv_names: ["Test:PV:Temp-Mon", "Test:PV:Pressure-Mon"], pvs: EMPTY_PVS }, filtered_keys: keys } });
    const list = wrapper.find(".v-card").find(".v-list").findAll("span .v-chip__content");

    for (let i = 0; i < list.length; i++) {
      expect(list.at(i).text()).toMatch("?");
    }
  })

  it('modifies PV values in real time', async () => {
    let item = { name: "Test", parent: "Test", pv_names: ["Test:PV:Temp-Mon", "Test:PV:Pressure-Mon"], pvs: EMPTY_PVS };
    const wrapper = mountFunction({ propsData: { item: { name: "Test", parent: "Test", pv_names: ["Test:PV:Temp-Mon", "Test:PV:Pressure-Mon"], pvs: EMPTY_PVS }, filtered_keys: keys } });

    expect(wrapper.find(".v-card").find(".v-list").findAll("span .v-chip__content").at(0).text()).toMatch("?");

    item.pvs.Temperature.value = "20 C";
    await wrapper.setProps({ item: item });

    expect(wrapper.find(".v-card").find(".v-list").findAll("span .v-chip__content").at(0).text()).toMatch("20 C");
  })
})
